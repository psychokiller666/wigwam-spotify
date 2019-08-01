export default ({ app }, inject) => {
    // skd ready
    window.onSpotifyWebPlaybackSDKReady = () => {}

    inject('webPlaybackSdkProps', () => {
        return {
            playerName: 'Spotify for Wigwam',
            playerInitialVolume: 1.0,
            playerRefreshRateMs: 1000,
            playerAutoConnect: true,
            onPlayerRequestAccessToken: () => app.$auth.getToken('local').slice(7),
            onPlayerRefreshAccessToken: () => {
                app.store.dispatch('refreshAuth/refreshToken')
            },
            onPlayerLoading: () => {},
            onPlayerWaitingForDevice: (data) => {
                app.store.dispatch('player/REQ_PLAYER_PLAY', data.device_id)
            },
            onPlayerError: error => {
                console.error(error)
            }
        }
    })
}