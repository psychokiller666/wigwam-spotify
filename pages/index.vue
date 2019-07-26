<template>
  <section class="container">
    <article class="mw6 center br3 pa3 pa4-ns mv3 ba b--black-10">
      <div class="tc">
        <img :src="user.images[0].url" class="br-100 h4 w4 dib ba b--black-05 pa2" title="Photo of a kitty staring at you">
        <h1 class="f3 mb2">{{ user.display_name }}</h1>
        <hr v-if="playback" />
        <div class="w-100 bb b--black-05 mt2" v-if="playback">
          <div class="fl w-20">
            <img :src='playback.track_window.current_track.album.images[0].url' class="ba bw1 db mid-gray"/>
          </div>
          <div class="fr w-70">
            <h3 class="f6 tl fw4 gray mt0">状态：<span :class="playback.paused ? 'bg-black ph2 pv1 white': 'bg-dark-green ph2 pv1 white'">{{ playback.paused ? '停止播放' : '正在播放' }}</span></h3>
            <h3 class="f5 tl fw4 white mt0 pb1">{{ playback.track_window.current_track.name }} - {{ playback.track_window.current_track.artists[0].name }}</h3>
            <Player class="fw4 white mt0 w-100" :duration="playback.duration" :position="playback.position"></Player>
          </div>
        </div>
        
      </div>
    </article>
  </section>
</template>

<script>
import Player from '~/components/Player.vue'

export default {
  asyncData ({ store }) {
    // return store.dispatch('player/REQ_CURRENT_STATE')
  },
  components: {
    Player
  },
  computed: {
    user () {
      return this.$auth.$state.user
    },
    playback () {
      return this.$store.state.player.playback
    }
  },

  data () {
    return {
      playerLoaded: false
    }
  },

  methods: {
    async handleState(state) {
      if (state) {
        this.$store.commit('player/SET_PLAYBACK_STATE', state)
        this.$store.dispatch('player/REQ_FEATURES')
      } else {
        this.clearStatePolling();
        await this.waitForDeviceToBeSelected()
      }
    },

    clearStatePolling() {
      clearInterval(this.statePollingInterval)
    },

    waitForDeviceToBeSelected() {
      return new Promise(resolve => {
        this.deviceSelectedInterval = setInterval(() => {
          if (this.webPlaybackInstance) {
            this.webPlaybackInstance.getCurrentState().then(state => {
              if (state !== null) {
                this.startStatePolling();
                clearInterval(this.deviceSelectedInterval);
                resolve(state);
              }
            })
          }
        })
      })
    },

    startStatePolling() {
      this.statePollingInterval = setInterval(async () => {
        let state = await this.webPlaybackInstance.getCurrentState();
        await this.handleState(state);
      }, this.webPlaybackSdkProps.playerRefreshRateMs || 1000);
    },

    waitForSpotify() {
      return new Promise(resolve => {
        if ('Spotify' in window) {
          resolve()
        } else {
          window.onSpotifyWebPlaybackSDKReady = () => {
            resolve()
          }
        }
      })
    },

    async setupWebPlaybackEvents() {
      let { Player } = window.Spotify
      this.webPlaybackInstance = new Player({
        name: this.webPlaybackSdkProps.playerName,
        volume: this.webPlaybackSdkProps.playerInitialVolume,
        getOAuthToken: async callback => {
          if (typeof this.webPlaybackSdkProps.onPlayerRequestAccessToken !== 'undefined') {
            let userAccessToken = await this.$auth.getToken('local').slice(7)
            callback(userAccessToken)
          }
        }
      })


      this.webPlaybackInstance.on('initialization_error', e => {
        this.webPlaybackSdkProps.onPlayerError('initialization_error:', e.message)
      })

      this.webPlaybackInstance.on('authentication_error', e => {
        this.webPlaybackInstance.onPlayerRefreshAccessToken()
      })

      this.webPlaybackInstance.on('account_error', e => {
        this.webPlaybackSdkProps.onPlayerError('account_error', e.message)
      })

      this.webPlaybackInstance.on('playback_error', e => {
        this.webPlaybackSdkProps.onPlayerError('playback_error', e.message)
      })

      this.webPlaybackInstance.on('player_state_changed', async state => {
        await this.handleState(state)
      })

      this.webPlaybackInstance.on('ready', data => {
        // 选择当前设备
        this.$store.dispatch('player/REQ_PLAYER_PLAY', data.device_id)
        // this.$store.dispatch('setDeviceId', data.device_id)
        // 选择当前设备
        // this.$store.dispatch('setActiveDevice', data.device_id)
      })

      if (this.webPlaybackSdkProps.playerAutoConnect) {
        this.webPlaybackInstance.connect()
      }
    },
    
    setupWaitingForDevice() {
      return new Promise(resolve => {
        this.webPlaybackInstance.on('ready', data => {
          resolve(data);
        })
      })
    }
  },
  async mounted () {
    // this.socketInit()
    this.deviceSelectedInterval = null
    this.statePollingInterval = null
    this.webPlaybackInstance = null
    this.webPlaybackSdkProps = {
      playerName: 'Spotify for Wigwam',
      playerInitialVolume: 1.0,
      playerRefreshRateMs: 1000,
      playerAutoConnect: true,
      onPlayerRequestAccessToken: () => this.$auth.getToken('local').slice(7),
      onPlayerRefreshAccessToken: () => {
        console.log(this.$store)
        this.$store.dispatch('refreshAuth/refreshToken')
        console.log('ssd')
      },
      onPlayerLoading: () => {},
      onPlayerWaitingForDevice: () => {
        this.playerLoaded = false
      },
      onPlayerError: e => {
        console.error(e)
      },
      onPlayerDeviceSelected: () => {
        this.playerLoaded = false
      }
    }

    // Notify the player is loading
    this.webPlaybackSdkProps.onPlayerLoading()

    // Wait for Spotify to load player
    await this.waitForSpotify()
    
    // Setup the instance and the callbacks
    await this.setupWebPlaybackEvents()

    // Wait for device to be selected
    let device_data = await this.setupWaitingForDevice()
    this.webPlaybackSdkProps.onPlayerWaitingForDevice(device_data)

    await this.waitForDeviceToBeSelected()
    this.webPlaybackSdkProps.onPlayerDeviceSelected()

    // console.log(this.current_track)
  }
}
</script>