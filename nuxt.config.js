
module.exports = {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    'tachyons/css/tachyons.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    ['~/modules/refresh-auth/', {
      vuexNamespace: 'refreshAuth',
      storageKey: 'my_refresh_token_key',
      loginUrl: '/auth/token',
      refreshTokenKey: 'refresh_token',
      refreshPeriod: 1800
    }],
    '@nuxtjs/axios',
    '@nuxtjs/auth'
  ],
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: '/auth/token', method: 'post', propertyName: 'access_token' },
          user: { url: '/auth/user', method: 'get', propertyName: 'body' }
        },
        tokenRequired: true,
        tokenType: 'Bearer'
      }
    },
    plugins: ['~/plugins/refresh-auth']
  },
  router: {
    middleware: ['auth']
  },

  /**
  * ENV
  */
  env: {
    spotify_clinet_id: process.env.NODE_ENV === 'development' ? '750c898be9b24dc6ab0b10087e802b72' : process.env.SPOTIFY_CLIENT_ID,
    spotify_clinet_secret: process.env.NODE_ENV === 'development' ? '144103e4d97141a781a09774f1362abe' : process.env.SPOTIFY_CLIENT_SECRET,
    redirct_url: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/callback' : process.env.SPOTIFY_REDIRECT_URL
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
    }
  }
}
