export const state = () => ({
    tempo: null,
    playing: false
})

export const mutations = {
    SET_TEMPO (state, action) {
        state.tempo = action
    },
    SET_PLAYING (state, action) {
        state.playing = action
    }
}

export const actions = {

    async REQ_LINK_BPM ({ state, commit }, tempo) {

        if (state.tempo === tempo) return false
        this.$socketClient().sendRequest({
            type: 'link',
            data: `bpm ${tempo}`
        }).then(() => {
            commit('SET_TEMPO', tempo)
        })
    },
    
    async REQ_BEAT_AT_TIME () {
        this.$socketClient().sendPacked({
            type: 'link',
            data: `beat-at-time ${this.state.player.playback.timestamp} 4`
        })
    },

    /**
     * force-beat-at-time
     * Sending the string force-beat-at-time followed by a floating-point beat number, a microsecond timestamp (an integer relative to the :start value returned in the status response), and a quantum value (as described above) tells Carabiner to forcibly and abruptly adjust the Link session timeline so that the specified beat falls at the specified point in time. The change will be communicated to all participants, and will result in audible shifts in playback.
     * Continuing the previous example, sending force-beat-at-time 1.0 73746356220 4 will tell Carabiner to adjust the Link session timeline so the second beat starts as close as possible to the specified moment (which previously was 25% of the way from the sixth to the seventh beat). Carabiner responds with a status message which reports the new :start timestamp of the timeline.
     */
    async REQ_FORCE_BEAT () {
        this.$socketClient().sendPacked({
            type: 'link',
            data: `force-beat-at-time 1.0 ${this.state.player.playback.timestamp} 4`
        })
    },
    
    /**
     * start-playing
     * Sending the string start-playing followed by a microsecond timestamp (an integer relative to the :start value returned in the status response) when Start/Stop Sync is enabled tells Carabiner to set the Link transport state to "playing", and inform any peers that are also participating in Start/Stop Sync.
     * Carabiner responds with a status message which reflects the new transport state.
     */
    async REQ_START_PLAYING ({ commit }) {
        this.$socketClient().sendRequest({
            type: 'link',
            data: `start-playing ${this.state.player.playback.timestamp}`
        }).then(() => {
            commit('SET_PLAYING', true)
        })
    },

    /**
     * stop-playing
     * Sending the string stop-playing followed by a microsecond timestamp (an integer relative to the :start value returned in the status response) when Start/Stop Sync is enabled tells Carabiner to set the Link transport state to "stopped", and inform any peers that are also participating in Start/Stop Sync.
     * Carabiner responds with a status message which reflects the new transport state.
     */
    async REQ_STOP_PLAYING () {
        this.$socketClient().sendRequest({
            type: 'link',
            data: `stop-playing ${this.state.player.playback.timestamp}`
        }).then(() => {
            commit('SET_PLAYING', false)
        })
    }
}