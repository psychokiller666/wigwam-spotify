const Router = require('koa-router')
const spotifyApi = require('../spotify')

const router = new Router({
  prefix: '/auth'
})

router.get('/user', async ctx => {
  await spotifyApi.getMe().then(res => {
    ctx.body = res
  }).catch(error => {
    ctx.status = error.statusCode
    ctx.body = error
  })
})

router.get('/login', async ctx => {
  let scopes = ['streaming', 
  'user-read-private',
  'user-read-birthdate',
  'user-read-email',
  'user-read-recently-played',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-library-modify',
  'user-follow-modify',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-top-read']
  let state = ctx.cookies.get('koa:sess.sig')
  ctx.body = {
    redirct: spotifyApi.createAuthorizeURL(scopes, state)
  }
})

router.post('/token', async ctx => {
  const code = ctx.request.body.code
  await spotifyApi.authorizationCodeGrant(code).then(data => {
    spotifyApi.setAccessToken(data.body.access_token)
    spotifyApi.setRefreshToken(data.body.refresh_token)

    ctx.body = data.body
  }).catch(error => {
    ctx.status = error.statusCode
    ctx.body = error
  })
})

router.post('/refresh', async ctx => {
  await spotifyApi.refreshAccessToken().then(data => {
    spotifyApi.setAccessToken(data.body.access_token)
    ctx.body = data.body
  }).catch(error => {
    ctx.status = error.statusCode
    ctx.body = error
  })
})

module.exports = router