const osc = require('osc')
const underworld = require('../underworld.json')
const underworld_f = require('../underworld_f.json')
const ObservableObject = require('observable-object-es6');
const { TaskTimer } =  require('tasktimer')

// const arenaConfig = require('./osc/arenaConfig')
const random = require('random')
const rangecal = require('rangecal')



// arenaConfig.then(res => {
//     console.log(res)
// })

// const fileUrl = new URL('file:///Users/psychokiller/Documents/Resolume Arena 6/Compositions/test123.avc')

// console.log(fs.readFileSync(fileUrl))

// Create an osc.js UDP Port listening on port 57121.
const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57121,
    remoteAddress: '0.0.0.0',
    remotePort: 57110,
    metadata: true
})
 
// Listen for incoming OSC bundles.
udpPort.on("bundle", function (oscBundle, timeTag, info) {
    // console.log("An OSC bundle just arrived for time tag", timeTag, ":", oscBundle)
    // console.log("Remote info is: ", info)
})

// 打开osc服务
udpPort.open()

let currentAnalysis = {}

const observed = new ObservableObject(currentAnalysis, {
    fields: ['bars', 'beats', 'tatums', 'segments', 'sections'],
    emitOnEachPropChange: true,
    emitSummaryChanges: true
})

function mapChange (type) {
    return new Promise((resolve, reject) => {
        if(type[0].oldValue !== type[0].newValue) {
            // console.log(type)
            resolve(type[0].newValue)
        }
    })
}

function mapAnalysis (progress, type) {
    for (let index in underworld[type]) {
        // console.log(index)
        if (progress > underworld[type][index].start && progress < (underworld[type][index].start + underworld[type][index].duration)) {
            observed[type] = Number(index)
            // console.log(index)
            break
        }
    }
}

function interPolate (a, b, t) {

}

udpPort.on("ready", function () {



    udpPort.send({
        address: `/composition/tempocontroller/tempo`,
        args: [
            {
                type: 'f',
                value: rangecal.rate(20, 500, underworld_f.tempo)
            }
        ]
    })

    udpPort.send({
        address: `/composition/layers/3/clips/7/connect`,
        args: [{
            type: 'i',
            value: 1
        }]
    })

    udpPort.send({
        address: `/composition/layers/1/clear`,
        args: [{
            type: 'i',
            value: 1
        }]
    })


    observed.on('change:bars', bars => {
        mapChange(bars).then(index => {
            index++
            if (index % 4 === 0) {
                console.log('bars: ', underworld.bars[index], index)
                udpPort.send({
                    address: `/composition/layers/1/clips/${random.int(1, 6)}/connect`,
                    args: [
                        {
                            type: 'i',
                            value: 1
                        }
                    ]
                })
            }
        })
    })



    observed.on('change:beats', beats => {
        mapChange(beats).then(res => {
            // console.log('beats: ', underworld.beats[res])
        })
    })
    observed.on('change:tatums', tatums => {
        mapChange(tatums).then(res => {
            // console.log(underworld.tatums[res])
            // udpPort.send({
            //     address: `/layer1/clip1/audio/volume/values`,
            //     args: [
            //         {
            //             type: 'f',
            //             value: 1
            //         }
            //     ]
            // })
            // console.log('tatums: ', res)
        })
    })
    observed.on('change:segments', segments => {
        mapChange(segments).then(res => {
            // console.log(underworld.segments[res].start, underworld.segments[res].loudness_max)
            // udpPort.send({
            //     address: `/layer1/clip1/audio/volume/values`,
            //     args: [
            //         {
            //             type: 'f',
            //             value: rangecal.rate(-40, 12, underworld.segments[res].loudness_max)
            //         }
            //     ]
            // })
        })
    })
    observed.on('change:sections', sections => {
        mapChange(sections).then(res => {
            
            // console.log('sections: ', underworld.sections[res])
            // 发送 tempo
            udpPort.send({
                address: "/composition/tempocontroller/tempo",
                args: [
                    {
                        type: "f",
                        value: rangecal.rate(20, 500, underworld.sections[res].tempo),
                    }
                ]
            })
            // console.log(res.start)
        })
    })
    
})

// udpPort.close()

// Timer with 1000ms (1 second) base interval resolution.
const timer = new TaskTimer(500)

// You can also execute some code on each tick... (every 1000 ms)
timer.on('tick', () => {
    const progress = timer.time.elapsed / 1000
    mapAnalysis(progress, 'bars',)
    mapAnalysis(progress, 'beats')
    mapAnalysis(progress, 'tatums')
    mapAnalysis(progress, 'segments')
    mapAnalysis(progress, 'sections')
    if (timer.time.elapsed >= 456480) timer.stop()
})
 
// Start the timer
timer.start()

module.exports = udpPort