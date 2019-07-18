const Router = require('koa-router')

const config = require('../../nuxt.config.js')
const SpotifyWebApi = require('spotify-web-api-node')

const client_id = config.env.spotify_clinet_id
const client_secret = config.env.spotify_clinet_secret;
const redirect_uri = config.env.redirct_url;

const spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
})

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

  let scopes = ['user-read-private', 'user-read-email']
  let state = 'some-state-of-my-choice'
  ctx.body = {
    redirct: spotifyApi.createAuthorizeURL(scopes, state)
  }
})

router.post('/token', async ctx => {
  const code = ctx.request.body.code
  await spotifyApi.authorizationCodeGrant(code).then(data => {
    spotifyApi.setAccessToken(data.body.access_token)
    spotifyApi.setRefreshToken(data.body.refresh_token)

    ctx.session.access_token = data.body.access_token
    ctx.session.refresh_token = data.body.refresh_token
    ctx.body = data.body
  }).catch(error => {
    ctx.status = error.statusCode
    ctx.body = error
  })
})

router.post('/refresh', async ctx => {
  await spotifyApi.refreshAccessToken().then(data => {
    spotifyApi.setAccessToken(data.body.access_token)
    ctx.session.access_token = data.body.access_token
    ctx.body = data.body
  }).catch(error => {
    ctx.status = error.statusCode
    ctx.body = error
  })
})

router.get('/getSession', async ctx => {
  ctx.body = {
    session: ctx.session
  }
})

module.exports = router