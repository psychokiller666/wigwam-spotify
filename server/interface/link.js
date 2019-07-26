const Router = require('koa-router')

const tcp = require('../tcp')

const testjson = require('../../aroundtheworld.json')

const router = new Router({
    prefix: '/link'
})


router.post('/bpm', ctx => {
    const tempo = ctx.request.body.tempo
    tcp.client.send(`bpm ${tempo}`)
    // console.log(ctx.request.body)
    ctx.body = {
        time: tcp.getTimestamps()
    }
})

module.exports = router