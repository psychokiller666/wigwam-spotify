const osc = require('osc')
const { oscws, playbackws } = require('./websocket')
const spotifyApi = require('./spotify')
const { TaskTimer } =  require('tasktimer')
var EventEmitter = require('events').EventEmitter
var event = new EventEmitter()

// 定时器
const timer = new TaskTimer(200)

timer.add([{
        id: 'oscsync',
        tickInterval: 1,
        totalRuns: 0,
        removeOnCompleted: true,
        callback: () =>  {
            // console.log('sss')
        }
    }, {
        id: 'pong',
        tickInterval: 5,
        totalRuns: 0,
        removeOnCompleted: true,
        callback: () => {

            playbackws.on('connection', (ws) => {
                ws.send({
                    type: 'playback',
                    data: 'dasds'
                })
            })
            spotifyApi.getMyCurrentPlaybackState().then(data => {
                // console.log(data)
                // ws.send({
                //     type: 'playback',
                //     data: data.body
                // })
                playbackws.send('dddaaa')
            }).catch(error => {
                // console.log(error)
            })
        }
    }
])



function start() {
    timer.start()
}

function stop() {
    timer.stop()
    if (Object.keys(timer._.tasks).length) {
        for (let index in timer._.tasks) {
            timer.remove(timer._.tasks[index].id)
        }
    }
    // observed.off('change:bars')
    // observed.off('change:beats')
    // observed.off('change:tatums')
    // observed.off('change:segments')
    // observed.off('change:sections')
}

const udpPort = new osc.UDPPort({
    localAddress: '0.0.0.0',
    localPort: 57121,
    remoteAddress: '0.0.0.0',
    remotePort: 57110
})
  
udpPort.on('ready', function () {
    consola.ready({
        message: `Broadcasting OSC over UDP to ${udpPort.options.remoteAddress}:${udpPort.options.remotePort}`,
        badge: true
    })
})
  
// udpPort.on('bundle', function (oscBundle, timeTag, info) {
//     // console.log("An OSC bundle just arrived for time tag", timeTag, ":", oscBundle)
//     // console.log("Remote info is: ", info)
// })

oscws.on('connection', (socket) => {
    const socketPort = new osc.WebSocketPort({
        socket: socket,
        metadata: true
    })

    const relay = new osc.Relay(udpPort, socketPort, {
        raw: true
    })

    // console.log(ws)
})

oscws.on('close', () => {
    udpPort.close()
    stop()
    event.removeAllListeners()
})

udpPort.open()

module.exports = { udpPort, start, stop }