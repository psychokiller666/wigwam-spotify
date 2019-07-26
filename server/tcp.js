const consola = require('consola')
const connmanager = require("tcp-ip-connman")
const heartBeatFactory = require('heartbeatjs')

const testjson = require('../aroundtheworld.json')


//Default TIMEOUT and INTERVAL are from heartbeatjs (https://www.npmjs.com/package/heartbeatjs)

const heartBeat = heartBeatFactory()
heartBeat.setPing('version')
heartBeat.setPong(`version "1.1.1"\n`)
heartBeat.setBeatInterval(500)
heartBeat.setBeatTimeout(2000)

const client = connmanager(heartBeat)

// Buffer to str
function ab2str(buffer) {
    return String.fromCharCode.apply(null, new Uint16Array(buffer))
}

// string version "1.1.1"
// Data received: {"type":"Buffer","data":[118,101,114,115,105,111,110,32,34,49,46,49,46,49,34,10]}
// <Buffer 76 65 72 73 69 6f 6e 20 22 31 2e 31 2e 31 22 0a>

client.onOpen(online => {
    consola.info('Carabiner(Ableton Link) 状态:', online)
})

client.onClose(online => {
    consola.info('Carabiner(Ableton Link) 状态:', online)
})

client.onRead(data => {
    consola.info('Ableton Link info: ',ab2str(data))
})

client.onRetry((error, num) => {
    consola.error(`Retry number ${num} due to error ${JSON.stringify(error)}`)
})

function getTimestamps () {
    let timesTamps = process.hrtime()
    return (timesTamps[0].toString() + timesTamps[1].toString()).substring(0, 12)
}

function init () {
    client.connect({
        host: 'localhost',
        port: 17000
    }).then(() => {
        consola.ready({
            message: 'Carabiner(Ableton Link) 连接成功',
            badge: true
        })
        client.send('status')

        // consola.log('bpm ' + testjson.track.tempo)
      
        // bpm
        // client.send('bpm ' + testjson.track.tempo)
        // beat-at-time
        // client.send('phase-at-time ' + getTimestamps() + ' ' + testjson.track.time_signature / testjson.track.time_signature_confidence)
        

    }).catch(error => {
        consola.error({
            message: error,
            badge:true
        })
    })
}

module.exports = {client, init, getTimestamps}