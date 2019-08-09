export const state = () => ({
    websocket: false,
    osc: false
})

export const mutations = {
    SET_WEBSCOKET (state, action) {
        state.websocket = action
    },
    SET_OSC (state, action) {
        state.osc = action
    }
}

export const actions = {
    nuxtServerInit(cx) {

    },
    
    START_WEBSOCKET ({ commit, dispatch }) {
        this.$socketClient().open().then(() => {
            commit('SET_WEBSCOKET', true)
            dispatch('SEND_SYNC')
        })
    },

    STOP_WEBSOCKET ({ commit }) {
        this.$socketClient().close().then(() => {
            commit('SET_WEBSCOKET', false)
        })
    },

    SEND_SYNC () {
        this.$socketClient().sendPacked({
            type: 'sync',
            data: true
        })
    },

    START_OSC ({ dispatch }) {
        this.$osc().open()
        // dispatch('SEND_SYNC')
    },

    STOP_OSC () {
        this.$osc().close()
    }
}