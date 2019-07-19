export default (async ({ app, store }) => {
    await (
        app.$auth.loggedIn ? app.$auth.fetchUserOnce().catch((e) => {
            console.error(e)
        }) : null
    )
     
    if(app.$auth.user) {
        store.dispatch('refreshAuth/initRefreshInterval')
    }
})