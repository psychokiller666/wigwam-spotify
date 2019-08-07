const { TaskTimer } =  require('tasktimer')
const random = require('random')
const rangecal = require('rangecal')
const timer = new TaskTimer(200)

// function mapAnalysis (analysis, progress, type) {
//     for (let index in analysis[type]) {
//         // console.log(index)
//         if (progress > analysis[type][index].start && progress < (analysis[type][index].start + analysis[type][index].duration)) {
//             observed[type] = Number(index)
//             // console.log(index)
//             break
//         }
//     }
// }

function mapAnalysis (ms, currentAnalysis, stateAnalysis, type) {
    return new Promise((resolve, reject) => {
        for (let index in currentAnalysis[type]) {
            if (index === stateAnalysis[type]) return false
            // console.log(currentAnalysis[type][index])
            if (ms < currentAnalysis[type][index].start) {
                resolve(index)
                // console.log(currentAnalysis[type].start)
                break
            }
        }
    })
}


export const state = () => ({
    timer: false,
    analysis: {
        bars: null,
        beats: null,
        tatums: null,
        segments: null,
        sections: null
    }
})

export const mutations = {
    SET_TIMER: (state, action) => {
        state.timer = action
    },
    SET_ANALYSIS: (state, action) => {
        if (state.analysis[action.type] === action.index) return false
        state.analysis[action.type] = action.index
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
            
            timer.add([{
                tickInterval: 1,
                totalRuns: 0,
                removeOnCompleted: true,
                callback: () =>  {
                    const ms = (data.progress + timer.time.elapsed) / this.$webPlaybackSdkProps().playerRefreshRateMs
                    // beats
                    for (let index in this.state.player.currentAnalysis.beats) {
                        if (ms < this.state.player.currentAnalysis.beats[index].start) {
                            if (index === state.analysis['beats']) return false
                            commit('SET_ANALYSIS', {
                                type: 'beats',
                                index: index
                            })
                            if (index++ % 4 ===0) {
                                dispatch('SEND_CLIP')
                            }
                            break
                        }
                    }

                    for (let index in this.state.player.currentAnalysis.sections) {
                        if (ms < this.state.player.currentAnalysis.sections[index].start) {
                            if (index === state.analysis['sections']) return false
                            commit('SET_ANALYSIS', {
                                type: 'sections',
                                index: index
                            })
                            dispatch('SEND_TEMPO', this.state.player.currentAnalysis.sections[index].tempo)
                            break
                        }
                    }

                    

                    if (ms >= data.duration) dispatch('REQ_TIMER_STOP')
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