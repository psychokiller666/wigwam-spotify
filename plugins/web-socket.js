import WebSocketAsPromised from 'websocket-as-promised';

export default ({ app }, inject) => {
  const websocket = new WebSocketAsPromised('ws://localhost:4000/playback', {
    packMessage: data => JSON.stringify(data),
    unpackMessage: data => JSON.parse(data),
    attachRequestId: (data, requestId) => Object.assign({id: requestId}, data), // attach requestId to message as `id` field
    extractRequestId: data => data && data.id,      
  })

  websocket.onError.addListener(event => {
    app.store.commit('SET_WEBSCOKET', false)
    console.error(event)
  })

  websocket.onMessage.addListener(Message => {
    const message = JSON.parse(Message)
    if (message.type === 'playback' && Object.keys(message.data).length) {
      app.store.dispatch('player/PONG_PLAYBACK', message.data)
    }
  })

  inject('socketClient', () => websocket)
}