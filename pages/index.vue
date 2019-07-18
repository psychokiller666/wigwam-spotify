<template>
  <section class="container">
    <article class="mw5 center br3 pa3 pa4-ns mv3 ba b--black-10">
      <div class="tc">
        <img :src="user.images[0].url" class="br-100 h4 w4 dib ba b--black-05 pa2" title="Photo of a kitty staring at you">
        <h1 class="f3 mb2">{{ user.display_name }}</h1> 
        <!-- <h2 class="f5 fw4 gray mt0">当前播放：{{ this.$store.state.currentsong.track_window.current_track.name }} - {{ this.$store.state.currentsong.track_window.current_track.album.name }}</h2> -->
      </div>
    </article>
  </section>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  computed: {
    user () {
      return this.$auth.$state.user
    }
  },
  components: {
    Logo
  }
}
</script>