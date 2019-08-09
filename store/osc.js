const { TaskTimer } =  require('tasktimer')
const random = require('random')
const rangecal = require('rangecal')
const timer = new TaskTimer(200)
const ObservableObject = require('observable-object-es6');

const observed = new ObservableObject({}, {
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

function mapAnalysis (analysis, progress, type) {
    for (let index in analysis[type]) {
        // console.log(index)
        if (progress > analysis[type][index].start && progress < (analysis[type][index].start + analysis[type][index].duration)) {
            observed[type] = Number(index)
            // console.log(index)
            break
        }
    }
}



export const state = () => ({
    timer: false
})

export const mutations = {
    SET_TIMER: (state, action) => {
        state.timer = action
    }
}

export const actions = {
    // 启动定时器
    REQ_TIMER_START: ({ commit, dispatch } ) => {
        dispatch('REQ_TIMER_SYNC').then(() => {
            dispatch('REQ_TIMER_STOP')
        }).then(() => {
            timer.start()
            commit('SET_TIMER', true)
        })
    },
    // 关闭定时器
    REQ_TIMER_STOP: ({ state, commit, dispatch }) => {
        timer.stop()
        if (Object.keys(timer._.tasks).length) {
            for (let index in timer._.tasks) {
                timer.remove(timer._.tasks[index].id)
            }
        }
        observed.off('change:bars')
        observed.off('change:beats')
        observed.off('change:tatums')
        observed.off('change:segments')
        observed.off('change:sections')

        commit('SET_TIMER', false)
        dispatch('SEND_PAUSE')
    },
    // 添加定时器方法
    REQ_TIMER_SYNC ({ state, commit, dispatch }) {
        this.dispatch(`player/REQ_CURRENT`).then(res => {
            return {
                progress: res.data.progress_ms,
                duration: res.data.item.duration_ms
            }
        }).then(data => {
            dispatch('SEND_RESYNC')

            // bars
            observed.on('change:bars', bars => {
                mapChange(bars).then(index => {
                    // console.log('bars: ', index)
                })
            })

            observed.on('change:beats', beats => {
                mapChange(beats).then(index => {
                    // console.log('beats: ', index)
                })
            })

            observed.on('change:tatums', tatums => {
                mapChange(tatums).then(index => {
                    // console.log('tatums :', index)
                })
            })

            observed.on('change:segments', segments => {
                mapChange(segments).then(index => {
                    // console.log('segments: ', index)
                    // console.log(this.state.player.currentAnalysis.segments[index].timbre[1])
                    console.log((this.state.player.currentAnalysis.segments[index].loudness_start + this.state.player.currentAnalysis.segments[index].loudness_max) / 2)

                })
            })

            observed.on('change:sections', sections => {
                mapChange(sections).then(index => {
                    // console.log('sections: ', index)
                })
            })
            timer.add([{
                tickInterval: 1,
                totalRuns: 0,
                removeOnCompleted: true,
                callback: () =>  {
                    const progress = (data.progress + timer.time.elapsed) / this.$webPlaybackSdkProps().playerRefreshRateMs
                    mapAnalysis(this.state.player.currentAnalysis, progress, 'bars')
                    mapAnalysis(this.state.player.currentAnalysis, progress, 'beats')
                    mapAnalysis(this.state.player.currentAnalysis, progress, 'tatums')
                    mapAnalysis(this.state.player.currentAnalysis, progress, 'segments')
                    mapAnalysis(this.state.player.currentAnalysis, progress, 'sections')
                    // console.log((progress * this.$webPlaybackSdkProps().playerRefreshRateMs) - this.state.player.playback.position)
                    if (data.progress >= data.duration) dispatch('REQ_TIMER_STOP')
                }
            }])
        })
    },


    // 同步bpm
    async SEND_TEMPO ({ }, tempo) {
        this.$osc().send({
            address: `/composition/tempocontroller/tempo`,
            args: [{
                type: 'f',
                value: rangecal.rate(20, 500, tempo)
            }]
        })
    },

    // 暂停节拍
    async SEND_PAUSE () {
        this.$osc().send({
            address: `/composition/tempocontroller/pause`,
            args: [{
                type: 'i',
                value: 1
            }]
        })
    },

    // 重新同步节拍
    async SEND_RESYNC () {
        this.$osc().send({
            address: `/composition/tempocontroller/resync`,
            args: [{
                type: 'i',
                value: 1
            }]
        })
    },

    // 切换画面
    async SEND_CLIP () {
        this.$osc().send({
            address: `/composition/layers/1/clips/${random.int(1, 6)}/connect`,
            args: [{
                    type: 'i',
                    value: 1
            }]
        })
    }                
}