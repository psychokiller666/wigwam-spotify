const Router = require('koa-router')
const spotifyApi = require('../spotify')

const router = new Router({
    prefix: '/player'
})

router.get('/getMyCurrentPlaybackState', async ctx => {
    await spotifyApi.getMyCurrentPlaybackState().then(data => {
        ctx.body = data.body
    }).catch(error => {
        ctx.status = error.statusCode
        ctx.body = error
    })
})

router.get('/getAudioFeaturesForTrack', async ctx => {
    const id = ctx.request.query.id
    await spotifyApi.getAudioFeaturesForTrack(id).then(data => {
        ctx.body = data.body
    }).catch(error => {
        ctx.status = error.statusCode
        ctx.body = error
    })
})

router.get('/getAudioAnalysisForTrack', async ctx => {
    const id = ctx.request.query.id
    await spotifyApi.getAudioAnalysisForTrack(id).then(data => {
        ctx.body = data.body
    }).catch(error => {
        ctx.status = error.statusCode
        ctx.body = error
    })
})



module.exports = router