<template>
  <section class="ticket-container">
    <div>
      <h1 class="ticket-title">
        [{{ $store.state.chartName }}] {{ $store.state.projectName }} <br> {{ $store.state.milestoneName }}
      </h1>
    </div>
    <div class="bar-chart">
      <BarChart :data="writeBarChart()" :options="BarOptions()"></BarChart>
    </div>
  </section>
</template>

<script>
  import ReadUserData from "@/components/methods/ReadUserData.vue";
  import BarChart from "@/components/chart/BarChart.vue";
  import ReadIssueData from "@/components/methods/ReadIssueData.vue";
  import FormatBarData from "@/components/methods/FormatBarData.vue";

  export default {
    mixins: [ReadUserData, ReadIssueData, FormatBarData],
    components: {
      BarChart
    },
    beforeCreate(){
      if(!this.$store.state.milestoneId){
        console.log('直接アクセスされたのでトップに移動します');
        this.$router.push('/');
      }
    },
    async mounted() {
      //ユーザーデータを取得する
      let userData = await this.getProjectUsers(this.$store.state.projectId);

      for (let i = 0; i < userData.length; i++) {
        this.labels.push(userData[i].name.substring(0, 2));
      }

      (async () => {
        for (let user of userData) {
          let data = await this.getAllIssueData(user.id);
          let fData = this.formatBouGraph(data);
          this.estimatedData.push(fData.estimatedTicketSize);
          this.finishedData.push(fData.finishedTicketFuterSize > 0 ? fData.finishedTicketSize - fData.finishedTicketFuterSize : fData.finishedTicketSize);
          this.finishedFutureData.push(fData.finishedTicketFuterSize);

        }
      })();

    },
    data() {
      return {
        labels: [],
        estimatedData: [],
        finishedData: [],
        finishedFutureData: []
      }
    },
    methods: {
      writeBarChart: function () {
        let nowDate = new Date();
        return {
          labels: this.$data.labels,
          datasets: [
            {
              label: `予定(${nowDate.getMonth() + 1}/${nowDate.getDate()})`,
              borderColor: 'rgba(182,182,182,1)',
              backgroundColor: 'rgba(182,182,182,0.4)',
              data: this.$data.estimatedData
            },
            {
              label: `予定(${nowDate.getMonth() + 1}/${nowDate.getDate()})以前`,
              borderColor: 'rgba(86,167,100,1)',
              backgroundColor: 'rgba(86,167,100,0.4)',
              data: this.$data.finishedData
            },
            {
              label: `予定(${nowDate.getMonth() + 1}/${nowDate.getDate()})以降`,
              borderColor: 'rgb(33, 144, 255,1)',
              backgroundColor: 'rgb(33, 144, 255,0.4)',
              data: this.$data.finishedFutureData
            }
          ]

        }
      },
      BarOptions: function () {
        return {}
      },

    }
  }

</script>

<style>
  .ticket-container {
    width: 100%;
  }

  .ticket-title {
    font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
    display: block;
    font-weight: bold;
    font-size: 24px;
    color: #35495e;
    letter-spacing: 1px;
    width: 100%;
    text-align: center;
    margin-top: 20px;
  }

  .bar-chart {
    width: 70vh;
    margin: 20px auto 20px;
  }
</style>
