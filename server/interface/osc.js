const Koa = require('koa')
const route = require('koa-route')
const spotifyApi = require('../spotify')
const websockify = require('koa-websocket')
const osc = require('osc')
const { TaskTimer } =  require('tasktimer')
const timer = new TaskTimer(100)

const oscws = websockify(new Koa())

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

oscws.ws.use(route.all('/osc', ctx => {

    const socketPort = new osc.WebSocketPort({
        socket: ctx.websocket,
        metadata: true
    })
  
    const relay = new osc.Relay(udpPort, socketPort, {
        raw: true
    })

    ctx.websocket.on('close', () => {
        // udpPort.close()
    })

    udpPort.open()
}))

oscws.ws.use(route.all('/playback', ctx => {
    
    timer.add([{
        id: 'pong',
        tickInterval: 10,
        totalRuns: 0,
        removeOnCompleted: true,
        callback: () => {
            spotifyApi.getMyCurrentPlaybackState().then(data => {
                // console.log(data)
                if (!Object.keys(data.body).length) return false
                ctx.websocket.send(JSON.stringify({
                    type: 'playback',
                    data: data.body
                }))
            }).catch(error => {
                // console.log(error)
            })
        }
    }])

    ctx.websocket.on('message', Message => {
        const message = JSON.parse(Message)
        switch (message.type) {
            case 'sync':
                if (message.data) {
                    // 获取当前播放
                    spotifyApi.getMyCurrentPlaybackState().then(playbackState => {
                        // 请求 features
                        spotifyApi.getAudioFeaturesForTrack(playbackState.body.item.id).then(features => {
                            // 发送tempo features.body.tempo

                            // 拍子 features.body.time_signature
                            
                            // 请求 analysis
                            spotifyApi.getAudioAnalysisForTrack(playbackState.body.item.id).then(analysis => {
                                console.log(analysis.body)
                            })
                            
                            console.log(features.body)
                        })
                    }).then(() => {
                        
                        timer.get('oscsync').reset()
                    }).catch(error => {
                        // console.log(error)
                    })
                } else {
                    timer.remove('oscsync')
                }
            break
        }
    })

    ctx.websocket.on('close', () => {
        timer.stop()
        if (Object.keys(timer._.tasks).length) {
            for (let index in timer._.tasks) {
                timer.remove(timer._.tasks[index].id)
            }
        }
    })

    timer.start()
}))

// oscws.listen(4000)

module.exports = { oscws, udpPort }