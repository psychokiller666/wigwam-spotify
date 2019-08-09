const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt-edge')

const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')

// router
const auth = require('./interface/auth')
const player = require('./interface/player')
const link = require('./interface/link')
const { oscws } = require('./interface/osc')

// const websockify = require('koa-websocket')
// const router = require('koa-router')

// const osc = require('osc')

// const api = router()

const app = new Koa()
// websockify(app)

// app.listen(3000);

// const udpPort = new osc.UDPPort({
//   localAddress: '0.0.0.0',
//   localPort: 57121,
//   remoteAddress: '0.0.0.0',
//   remotePort: 57110
// })

// udpPort.on('ready', function () {
//   consola.ready({
//       message: `Broadcasting OSC over UDP to ${udpPort.options.remoteAddress}:${udpPort.options.remotePort}`,
//       badge: true
//   })
// })

// app.ws.use((ctx) => {
//   const socketPort = new osc.WebSocketPort({
//       socket: ctx.websocket,
//       metadata: true
//   })

//   const relay = new osc.Relay(udpPort, socketPort, {
//       raw: true
//   })
// })

// udpPort.open()


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
    // consola.info(str)
  }))

  // body-parser
  app.use(bodyParser())

  // router
  app.use(auth.routes()).use(auth.allowedMethods())
  app.use(player.routes()).use(player.allowedMethods())
  app.use(link.routes()).use(link.allowedMethods())
  // app.use(osc.routes()).use(osc.allowedMethods())

  app.use((ctx) => {
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })
  // console.log(io)
  app.listen(port, host)
  oscws.listen(4000)

  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
  consola.ready({
    message: `Websocket listening on ws://${host}:4000`,
    badge: true
  })
  
}

start()
