import WebSocketAsPromised from 'websocket-as-promised';

export default ({ app }, inject) => {
  const wsp = new WebSocketAsPromised('ws://localhost:4000/websocket', {
    packMessage: data => JSON.stringify(data),
    unpackMessage: data => JSON.parse(data),
    attachRequestId: (data, requestId) => Object.assign({id: requestId}, data), // attach requestId to message as `id` field
    extractRequestId: data => data && data.id,      
  })


  wsp.onOpen.addListener(() => {
    app.store.commit('SET_WEBSCOKET', true)
  })

  wsp.onClose.addListener(() => {
    app.store.commit('SET_WEBSCOKET', false)
  })

  wsp.onError.addListener(event => {
    console.error(event)
  })

  // wsp.onResponse.addListener(data => console.log(data));

  // wsp.onMessage.addListener(message => console.log(message));




  inject('socketClient', () => wsp)
}