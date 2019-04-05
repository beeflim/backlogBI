<template>
  <section class="container">
    <div>
      <app-logo/>
      <h1 class="title">
        finish ticket chart
      </h1>
      <span>{{ $store.state.projectId }}</span><br>
      <span>{{ $store.state.projectName }}</span><br>
      <span>{{ $store.state.milestoneId }}</span><br>
      <span>{{ $store.state.milestoneName }}</span><br>
      <span>{{ $store.state.chartId }}</span><br>
      <span>{{ $store.state.chartName }}</span><br>
      <span>{{ $store.state.issueCount }}</span><br>
    </div>
  </section>
</template>

<script>
  import AppLogo from '~/components/AppLogo.vue'
  import ReadUserData from "@/components/methods/ReadUserData.vue";

  export default {
    mixins: [ReadUserData],
    components: {
      AppLogo
    },
    async mounted() {
      let data = await this.getProjectUsers(this.$store.state.projectId);
      console.log(data);
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
