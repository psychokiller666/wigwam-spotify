export default (async ({ isClient ,app, store }) => {

    if (!isClient) return false

    await (
        app.$auth.loggedIn ? app.$auth.fetchUserOnce().catch((e) => {
            console.error(e)
        }) : null
    )
     
    if(app.$auth.user) {
        store.dispatch('refreshAuth/initRefreshInterval')
    }
})