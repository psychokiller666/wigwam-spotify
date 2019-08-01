
export const state = () => ({
    playLoaded: false,
    playback: '',
    axiosLoaded: true,
    currentFeatures: '',
    currentAnalysis: '',
    nextFeatures: '',
    nextAnalysis: ''
})

export const mutations = {
    // axios 请求开关
    SET_AXIOS_LOADED: (state, action) => {
        state.axiosLoaded = action
    },

    // playback skd 加载状态 
    SET_PLAYLOADED: (state, action) => {
        state.playLoaded = action
    },

    // playback state
    SET_PLAYBACK_STATE: (state, action) => {
        state.playback = action
    },

    // current
    SET_CURRENT_FEATURES: (state, action) => {
        state.currentFeatures = action
    },
    SET_CURRENT_ANALYSIS: (state, action) => {
        state.currentAnalysis = action
    },

    // next
    SET_NEXT_FEATURES: (state, action) => {
        state.nextFeatures = action
    },
    SET_NEXT_ANALYSIS: (state, action) => {
        state.nextAnalysis = action
    }
}

export const actions = {
    /**
     * 更改playback信息，以及处理同步ableton link信息
     * @param value playback 传回的state 
     */
    PONG_PLAYBACK ({state, dispatch, commit}, value) {
        commit('SET_PLAYBACK_STATE', value)
        const position = value.position / this.$webPlaybackSdkProps().playerRefreshRateMs

        // currentFeatures
        // currentAnalysis
        if (state.currentFeatures.id != state.playback.track_window.current_track.id && state.axiosLoaded) {
            dispatch('REQ_FEATURES', {
                id: state.playback.track_window.current_track.id,
                type: 'SET_CURRENT_FEATURES'
            }).then(() => {
                // 发送bpm
                this.dispatch('link/REQ_LINK_BPM', state.currentFeatures.tempo).then(() => {
                    // force-beat-at-time
                    this.dispatch('link/REQ_FORCE_BEAT')
                })
                
            }).then(() => {
                dispatch('REQ_ANALYSIS', {
                    id: state.playback.track_window.current_track.id,
                    type: 'SET_CURRENT_ANALYSIS'
                })
            })
        }

        // nextFeatures
        // nextAnalysis
        if (!state.playback.track_window.next_tracks.length) return false
        if (state.nextFeatures.id != state.playback.track_window.next_tracks[0].id && state.axiosLoaded) {
            dispatch('REQ_FEATURES', {
                id: state.playback.track_window.next_tracks[0].id,
                type: 'SET_NEXT_FEATURES'
            }).then(() => {
                dispatch('REQ_ANALYSIS', {
                    id: state.playback.track_window.next_tracks[0].id,
                    type: 'SET_NEXT_ANALYSIS'
                })
            })
        }

        // 暂停播放
        if (state.playback.paused != this.state.link.playing) {
            this.dispatch()
        }

        // console.log(this)

        // sections
        if (state.currentAnalysis && state.axiosLoaded && !state.playback.paused) {
            for (let item of state.currentAnalysis.sections) {
                if (Number((item.start + item.duration).toFixed(3)) > position) {
                    this.dispatch('link/REQ_LINK_BPM', item.tempo).then(res => {
                        if (typeof res === 'undefined') {
                            // force-beat-at-time
                            this.dispatch('link/REQ_FORCE_BEAT')   
                        }
                    })
                    break
                }
            }
        }

        // beats
        // if (state.currentAnalysis && state.axiosLoaded && !state.playback.paused) {
        //     for (let item of state.currentAnalysis.beats) {
        //         if (Number((item.start).toFixed(3)) > position) {
        //             // this.dispatch('link/REQ_BEAT_AT_TIME')
        //         }
        //     }
        // }

        // tatums

        // bar
    },

    /**
     * 请求 FEATURES
     */
    async REQ_FEATURES ({ commit}, {
        id: id,
        type: type  // SET_CURRENT_FEATURES, SET_NEXT_FEATURES
    }) {
        commit('SET_AXIOS_LOADED', false)
        await this.$axios.get(`/player/getAudioFeaturesForTrack?id=${id}`).then(res => {
            commit(type, res.data)
        }).then(() => {
            commit('SET_AXIOS_LOADED', true)
        })
    },

    /**
     * 请求 ANALYSIS
     */
    async REQ_ANALYSIS ({ commit }, {
        id: id,
        type: type  // SET_CURRENT_ANALYSIS, SET_NEXT_ANALYSIS
    }) {
        commit('SET_AXIOS_LOADED', false)
        await this.$axios.get(`/player/getAudioAnalysisForTrack?id=${id}`).then(res => {
            commit(type, res.data)
        }).then(() => {
            commit('SET_AXIOS_LOADED', true)
        })
    },


    // async REQ_LINK_BPM ({ }, tempo) {
    //     await this.$axios.put('/link/bpm', {
    //         tempo: tempo
    //     })
    // },

    async REQ_PLAYER_PLAY ({ }, id) {
        await this.$axios.put('https://api.spotify.com/v1/me/player', {
            device_ids: [id],
            player: false
        })
    }
}