export const state = () => ({
    websocket: false
})

export const mutations = {
    SET_WEBSCOKET (state, action) {
        state.websocket = action
    }
}

export const actions = {
    nuxtServerInit(cx) {

    },
    
    START_WEBSOCKET () {
        this.$osc().open()
    },

    STOP_WEBSCOKET () {
        this.$osc().close()
    }
}