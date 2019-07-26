const Router = require('koa-router')

const tcp = require('../tcp')

const testjson = require('../../aroundtheworld.json')

const router = new Router({
    prefix: '/test'
})


router.get('/getbpm', ctx => {
    ctx.body = {
        time: tcp.getTimestamps()
    }
})




module.exports = router