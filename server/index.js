const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt-edge')

const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')

// router
const auth = require('./interface/auth.js')

const app = new Koa()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // log
  app.use(logger((str, args) => {
    // redirect koa logger to other output pipe
    // default is process.stdout(by console.log function)
    consola.info(str)
  }))

  // body-parser
  app.use(bodyParser())

  // session
  app.keys = ['some secret hurr']
  const CONFIG = {
     key: 'koa:sess',   //cookie key (default is koa:sess)
     maxAge: 86400000,  // cookie的过期时间 maxAge in ms (default is 1 days)
     overwrite: true,  //是否可以overwrite    (默认default true)
     httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
     signed: true,   //签名默认true
     rolling: false,  //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
     renew: false,  //(boolean) renew session when session is nearly expired,
  }
  app.use(session(CONFIG, app))

  // router
  app.use(auth.routes()).use(auth.allowedMethods())

  app.use((ctx) => {
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()
