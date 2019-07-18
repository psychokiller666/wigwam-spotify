<template>
  <div class="container">
    Logging in...
  </div>
</template>

<script>
export default {
  auth: false,
  asyncData (ctx) {
    return ctx.$auth.login({
      data: {
        code: ctx.query.code
      }
    }).then(res => {
      ctx.redirect('/')
    })
  }
}
</script>