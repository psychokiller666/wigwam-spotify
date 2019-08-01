<template>
    <section class="container">
        <article class="mw6 center br3 pa3 pa4-ns mv3 ba b--black-10">
            <div class="tc">
              <img :src="user.images[0].url" class="br-100 h4 w4 dib ba b--black-05 pa2" title="Photo of a kitty staring at you">
              <h1 class="f3 mb2">{{ user.display_name }}</h1>
              <Playback  />
            </div>
            <!-- <div class="test" v-if="currentAnalysis">
              <button @click="requestbeatattime">request-beat-at-time</button>
              <button @click="forcebeatattime">force-beat-at-time</button>
            </div> -->
        </article>
    </section>
</template>

<script>
import Playback from '~/components/Playback'


export default {
    components: {
        Playback
    },

    computed: {
      user () {
        return this.$auth.$state.user
      },
      playLoaded () {
        return this.$store.state.player.playLoaded
      },
      playback () {
        return this.$store.state.player.playback
      },
      currentAnalysis () {
        return this.$store.state.player.currentAnalysis
      },
      currentId() {
        return this.$store.state.player.currentId
      },
      analysisLoad () {
        return this.$store.state.player.currentAnalysisLoad
      }
    },

    methods: {
      requestbeatattime () {
        this.$axios.get('/link/request-beat-at-time')
      },
      forcebeatattime () {
        this.$axios.put('/link/force-beat-at-time')
      },
    },

    mounted () {

    }
}
</script>