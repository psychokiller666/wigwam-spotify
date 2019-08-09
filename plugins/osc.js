import osc from 'osc/dist/osc-browser.min.js'


export default ({ app }, inject) => {
    const oscPort = new osc.WebSocketPort({
        url: 'ws://localhost:4000/osc',
        metadata: true
    })

    oscPort.on('ready', () => {
        app.store.commit('SET_OSC', true)
    })

    oscPort.on('error', () => {
        app.store.commit('SET_OSC', false)
    })

    // console.log(oscPort)
    inject('osc', () => oscPort)
}