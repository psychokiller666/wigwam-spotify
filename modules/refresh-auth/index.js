import path from 'path'

export default function refreshAuth (moduleOptions) {
  this.addPlugin({
    src: path.resolve(__dirname, 'src', 'plugin.js'),
    ssr: false,    
    fileName: 'refresh-auth.js',
    options: Object.assign({
      vuexNamespace: 'refreshAuth',
      storageKey: 'my_refresh_token_key',
      loginUrl: '/auth/token',
      logoutUrl: '/auth/logout',
      refreshUrl: '/auth/refresh',
      accessTokenKey: 'access_token',
      refreshTokenKey: 'refresh_token',
      refreshPeriod: 600,
      refreshUsingHeader: false
    }, moduleOptions)
  })
}