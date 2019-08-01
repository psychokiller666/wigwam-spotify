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
        // console.log(cx)
        // dispatch('START_WEBSOCKET')
    },
    START_WEBSOCKET ({ commit }) {
        // console.log(this.$socketClient())
        // 连接
        this.$socketClient().open().then(() => {
            commit('SET_WEBSCOKET', true)
        })
        // 关闭
        // this.$socketClient().
        // this.$socketClient().connect()
    }
}