<template>
  <div class="container">
    <article class="mw5 center br3 pa3 pa4-ns mv3 ba b--black-10">
      Logging in...
    </article>
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