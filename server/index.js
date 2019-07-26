const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt-edge')

const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const websockify = require('koa-websocket')

// router
const auth = require('./interface/auth')
const player = require('./interface/player')
const link = require('./interface/link')
const test = require('./interface/test')


const app = new Koa()
const websocket = websockify(app)

const spotifyApi = require('./spotify')
const tcp = require('./tcp')


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
    // consola.info(str)
  }))

  // body-parser
  app.use(bodyParser())

  // // websocket
  // websocket.ws.use((ctx, next) => {
  //   ctx.session.currentId = null
  //   setInterval(() => {
  //     spotifyApi.getMyCurrentPlaybackState().then(data => {
  //       if (Object.keys(data.body).length === 0) {
  //         return false
  //       } else {
  //         ctx.websocket.send(JSON.stringify(data.body))
  //         return data.body.item.id
  //       }
  //     }).then(id => {
  //       // 获取Audio Analysis
  //       if (ctx.session.currentId != id && id) {
  //         ctx.session.currentId = id
  //         console.log(id)
  //         // spotifyApi.getAudioAnalysisForTrack(id).then(data => {
  //         //   // console.log(data.body)
  //         // }).catch(error => {
  //         //   // consola.info('getAudioAnalysisForTrack error', error)
  //         // })
  //         // console.log(id)
  //       }
  //     }).catch(error => {
  //       // consola.info('getMyCurrentPlaybackState error', error)
  //     })  
  //   }, 800)
  //   // return `next` to pass the context (ctx) on to the next ws middleware
  //   return next(ctx);
  // })

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
  app.use(player.routes()).use(player.allowedMethods())
  app.use(link.routes()).use(link.allowedMethods())
  app.use(test.routes()).use(test.allowedMethods())

  app.use((ctx) => {
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })

  // tcp
  app.listen(port, host)
  // websocket.listen(4000, host)
  tcp.init()


  // console.log(testjson.track.time_signature / testjson.track.time_signature_confidence)

  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
  // consola.ready({
  //   message: `Websocket listening on ws://${host}:4000`,
  //   badge: true
  // })
  
}

start()
