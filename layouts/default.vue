<template>
  <article class="athelas">
    <div class="vh-100 dt w-100 tc bg-dark-gray white cover wigwam-bg">
      <div class="dtc v-mid">
        <header class="white-70">
          <h2 class="f6 fw1 ttu tracked mb2 lh-title">作者：{{ config.author }}</h2>
          <h3 class="f6 fw1 lh-title">版本：{{ config.version }}</h3>
        </header>
        <h1 class="f1 f-headline-l fw1 i white-60">{{ config.name }}</h1>
        <blockquote class="ph0 mh0 measure f4 lh-copy center">
          <p class="fw1 white-70">
            {{ config.description }}
          </p>
          <nuxt/>
        </blockquote>
      </div>
    </div>
  </article>
</template>

<script>
import config from '~/package.json'

export default {
  computed: {
    config () {
      return config
    } 
  }
}
</script>

<style>
  .wigwam-bg {
    background:url(https://s2.ax1x.com/2019/07/24/eA6TtH.jpg) no-repeat center;
  }
</style>
