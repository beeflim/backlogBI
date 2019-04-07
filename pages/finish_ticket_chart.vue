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

  export default {
    mixins: [ReadUserData, ReadIssueData],
    components: {
      BarChart
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
          this.format(data);
        }
      })();

    },
    data() {
      return {
        labels: [],
        estimatedData: [],
        finishedData: []
      }
    },
    methods: {
      format: function (issueData) {

        let nowDate = new Date();

        let estimatedSize = 0;
        let finishedSize = 0;

        Object.values(issueData).forEach(issue => {
          //現在日までの予定工数の合計
          let due = issue.dueDate.substring(0, 10).split('-');
          let dueDate = new Date(due[0], due[1] - 1, due[2]);
          if (dueDate <= nowDate) {
            estimatedSize += issue.estimatedHours;
          }
          //現在の完了工数
          if (issue.status.name === "完了") {
            finishedSize += issue.actualHours;
          }
        });
        this.estimatedData.push(Math.round(estimatedSize * 100) / 100);
        this.finishedData.push(Math.round(finishedSize * 100) / 100);
      },
      writeBarChart: function () {
        let nowDate = new Date();
        return {
          labels: this.$data.labels,
          datasets: [
            {
              label: `予定(${nowDate.getMonth()+1}/${nowDate.getDate()})`,
              borderColor: 'rgba(182,182,182,1)',
              backgroundColor: 'rgba(182,182,182,0.4)',
              data: this.$data.estimatedData
            },
            {
              label: '実績',
              borderColor: 'rgba(86,167,100,1)',
              backgroundColor: 'rgba(86,167,100,0.4)',
              data: this.$data.finishedData
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
    min-height: 100vh;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .ticket-title {
    font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
    display: block;
    font-weight: bold;
    font-size: 24px;
    color: #35495e;
    letter-spacing: 1px;
  }

  .bar-chart {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }
</style>
