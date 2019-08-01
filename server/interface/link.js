const Router = require('koa-router')

const tcp = require('../tcp')

const testjson = require('../../aroundtheworld.json')

const router = new Router({
    prefix: '/link'
})


router.put('/bpm', ctx => {
    const tempo = ctx.request.body.tempo
    tcp.client.send(`bpm ${tempo} \n`)
    // console.log(ctx.request.body)
    ctx.body = {
        time: tcp.getTimestamps()
    }
})

router.put('/beat-at-time', ctx => {
    tcp.client.send(`beat-at-time ${tcp.getTimestamps()} 4 \n`)
    ctx.body ={
        time: tcp.getTimestamps()
    }
})

router.put('/phase-at-time', ctx => {
    tcp.client.send(`phase-at-time ${tcp.getTimestamps()} 4 \n`)
    ctx.body ={
        time: tcp.getTimestamps()
    }
})

router.put('/time-at-beat', ctx => {
    const beat = ctx.request.body.beat
    tcp.client.send(`time-at-beat ${beat} 4`)
    ctx.body ={
        time: tcp.getTimestamps()
    }
})

router.put('/request-beat-at-time', ctx => {
    tcp.client.send(`request-beat-at-time ${tcp.getTimestamps()} \n`)
    ctx.body ={
        time: tcp.getTimestamps()
    }
})

router.put('/force-beat-at-time', ctx => {
    tcp.client.send(`force-beat-at-time 2 ${tcp.getTimestamps()} 4 \n`)
    ctx.body ={
        time: tcp.getTimestamps()
    }
})


module.exports = router