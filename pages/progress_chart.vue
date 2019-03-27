<template>
  <section class="container">
    <div>
      <app-logo/>
      <h1 class="title">
        progress_chart
      </h1>
    </div>
  </section>
</template>

<script>
import AppLogo from '~/components/AppLogo.vue'
import Vue from 'vue'
import HorizontalBarChart from '~/components/HorizontalBarChart'
export default {
  components: {
    AppLogo
  },
  async mounted() {

  }
}

</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}
</style>
