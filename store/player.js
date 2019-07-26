export const state = () => ({
    playback: '',
    currentId: null,
    currentAnalysis: '',
    currentFeatures: '',
    nuxtAnalysis: '',
    nuxtFeatures: ''
})

export const mutations = {
    SET_PLAYBACK_STATE: (state, action) => {
        state.playback = action
    },
    SET_CURRENT_ANALYSIS: (state, action) => {
        state.currentAnalysis = action
    },
    SET_CURRENT_FEATURES: (state, action) => {
        state.currentFeatures = action
        state.currentId = action.id
    }
}

export const actions = {
    async REQ_FEATURES ({ commit, state, dispatch }) {
        if (state.currentId != state.playback.track_window.current_track.id)
        await this.$axios.get(`/player/getAudioFeaturesForTrack?id=${state.playback.track_window.current_track.id}`).then(res => {
            commit('SET_CURRENT_FEATURES', res.data)
        }).then(() => {
            dispatch('REQ_LINK_BPM')
            dispatch('REQ_ANALYSIS')
        })
    },
    async REQ_ANALYSIS ({ commit, state, dispatch }) {
        await this.$axios.get(`/player/getAudioAnalysisForTrack?id=${state.currentId}`).then(res => {
            commit('SET_CURRENT_ANALYSIS', res.data)
        })
    },
    async REQ_LINK_BPM ({ state }) {
        await this.$axios.post('/link/bpm', {
            tempo: state.currentFeatures.tempo
        })
    },
    async REQ_PLAYER_PLAY ({ }, id) {
        await this.$axios.put('https://api.spotify.com/v1/me/player', {
            device_ids: [id],
            player: false
        })
    }
}