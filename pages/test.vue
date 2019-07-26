<template>
  <div class="container">
    <article class="db pt3 pb4 ph3 ph0-l relative">
      <button @click="getbpm">get bpm</button>

      <!-- <ProgressBar class="mb4 f6 fw6 dark-gray" size="large" bar-color="#3AB954" val="60" text="60%" title="60%" /> -->

    </article>
  </div>
</template>

<script>
// import ProgressBar from '~/components/Progress.vue'
// import Player from '~/components/Player'

export default {
  auth: false,
  // asyncData (ctx) {
  //   return ctx.$auth.login({
  //     data: {
  //       code: ctx.query.code
  //     }
  //   }).then(res => {
  //     ctx.redirect('/')
  //   })
  // }

  components: {
    // ProgressBar
  },
  methods: {
    getbpm () {
      this.$axios.get('/test/getbpm').then(res => {
        console.log(res.data.time)
      })
    }
  }
}
</script>