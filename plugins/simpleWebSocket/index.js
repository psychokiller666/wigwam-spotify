import WebSocketClient from './WebSocketClient'

export default {

  install (Vue, connection, options) {
    const socketClient = new WebSocketClient(connection, options)
    if (options.autoConnect) {
      socketClient.connect()
    }
    // socketClient.connect()
    Vue.prototype.$socketClient = socketClient
  }

}
