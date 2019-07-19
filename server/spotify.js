const SpotifyWebApi = require('spotify-web-api-node')
const config = require('../nuxt.config.js')

const client_id = config.env.spotify_clinet_id
const client_secret = config.env.spotify_clinet_secret;
const redirect_uri = config.env.redirct_url;

const spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
})

module.exports = spotifyApi