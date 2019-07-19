export const state = () => ({
    currentState: {},
    currentId: null
})

export const mutations = {
    SET_CURRENT_STATE: function (state, action) {
        // console.log(action)
        state.currentState = action
    },
    SET_CURRENT_ID: function (state, action) {
        state.currentId = action
    }
}

export const actions = {
    async REQ_CURRENT_STATE ({ commit }) {
        await this.$axios.get('/player/getMyCurrentPlaybackState').then(res => {
            commit('SET_CURRENT_STATE', res.data)
        })
    }
}