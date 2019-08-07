import osc from 'osc/dist/osc-browser.min.js'


export default ({ app }, inject) => {
    const oscPort = new osc.WebSocketPort({
        url: 'ws://localhost:4000/websocket',
        metadata: true
    })

    oscPort.on('ready', () => {
        app.store.commit('SET_WEBSCOKET', true)
    })

    oscPort.on('message', (oscMessage) => {
        console.log(oscMessage)
    })

    // console.log(oscPort)
    inject('osc', () => oscPort)
}