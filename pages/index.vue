<template>
  <section class="container">
    <article class="mw6 center br3 pa3 pa4-ns mv3 ba b--black-10">
      <div class="tc">
        <img :src="user.images[0].url" class="br-100 h4 w4 dib ba b--black-05 pa2" title="Photo of a kitty staring at you">
        <h1 class="f3 mb2">{{ user.display_name }}</h1>
        <hr />
        <h3 class="f7 fw4 white mt0">socket： {{ scoketStatus ? '在线' : '离线' }}</h3>
        <hr v-show="Object.keys(currentState).length" />
        <div class="dt w-100 bb b--black-05 pb2 mt2" v-if="Object.keys(currentState).length">
          <div class="dtc w2 w3-ns v-mid">
            <img :src='currentState.item.album.images[2].url' class="ba bw1 db w2 w3-ns h2 h3-ns mid-gray"/>
          </div>
          <div class="dtc v-mid pl3 tl">
            <h3 class="f6 fw4 gray mt0">当前设备：{{ currentState.device.name }} / 状态：<span :class="currentState.is_playing ? 'bg-dark-green ph2 pv1 white': 'bg-black ph2 pv1 white'">{{ currentState.is_playing ? '正在播放' : '停止播放' }}</span></h3>
            <h3 class="f5 fw4 white mt0">{{ currentState.item.name }} - {{ currentState.item.artists[0].name }}</h3>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script>
export default {
  asyncData ({ store }) {
    return store.dispatch('player/REQ_CURRENT_STATE')
  },

  computed: {
    user () {
      return this.$auth.$state.user
    },
    currentState() {
      return this.$store.state.player.currentState
    }
  },

  data () {
    return {
      scoketStatus: false
    }
  },

  methods: {
    socketInit () {
      this.$socketClient.onOpen = () => {
        this.scoketStatus = true
        console.info('socket 通信成功')
      }
      this.$socketClient.onMessage = (msg) => {
        if (msg.data.statusCode) return false
        this.$store.commit('player/SET_CURRENT_STATE', JSON.parse(msg.data))
      }
      this.$socketClient.onClose = (msg) => {
        this.scoketStatus = false
        console.info('socket 关闭')
      }
      this.$socketClient.onError = (msg) => {
        this.scoketStatus = false
        console.error('socket 错误')
      }
      
      // 手动连接
      this.$socketClient.connect()
    }
  },
  mounted () {
    this.socketInit()
    // console.log(this.currentState)

    // this.$axios.get('/player/getAudioFeaturesForTrack', {
    //   params: {
    //     id: 'ss'
    //   }
    // }).then(res => {
    //   console.log(res)
    // })
  }
}
</script>