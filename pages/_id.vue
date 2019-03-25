<template>
  <section class="container">
    <div>
      <h1 class="title">
        UserID: {{userId}}
      </h1>
    </div>
  </section>
</template>

<script>
export default {
  props:['userId'],
mounted(){
  console.log(this.$route.params.id);
},
  date() {
    return {
      userId : this.$route.params.id
    }
  }
}
</script>

<style>
</style>

