<template>
  <section class="container">
    <div>
      <h1 class="title" @click="getIssueData()">
        {{ $store.state.projectName }} - {{ $store.state.milestoneName }}<br>{{ $store.state.chartName }}
      </h1>
      <div>
        <LineChart :data="lineChartData()" :options="lineOptions()"></LineChart>
      </div>
    </div>
  </section>
</template>

<script>
  import AppLogo from '~/components/AppLogo.vue'
  import Vue from 'vue'
  import LineChart from '@/components/chart/LineChart.vue'

  export default {
    components: {
      AppLogo, LineChart
    },
    async mounted() {
      let issueData = this.getIssueData();
      issueData = this.format(issueData);

      //データをチャートように成型する
      //チャートを表示する
    },
    methods: {
      lineChartData: function () {
        return {
          labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          datasets: [
            {
              label: "Prime and Fibonacci",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
            },
            {
              label: "My Second dataset",
              fillColor: "rgba(151,187,205,0.2)",
              strokeColor: "rgba(151,187,205,1)",
              pointColor: "rgba(151,187,205,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(151,187,205,1)",
              data: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
            }
          ]
        }
      }, lineOptions: function () {
        return {}
      },
      getIssueData: async function () {
        //TODO リファクタリング
        let issueCount = this.$store.state.issueCount - 1;

        let issueList = {};
        let getSize = 100;
        let searchStartDate = '';
        let url = `https://${localStorage.spaceName}.backlog.jp/api/v2/issues?apiKey=${localStorage.token}&projectId[]=${this.$store.state.projectId}&milestoneId[]=${this.$store.state.milestoneId}&count=${getSize}${searchStartDate}&sort=startDate&order=asc`;

        await this.$axios.$get(url)
          .then((res) => {
            let size = 0;
            res.forEach(issueData => {
              issueList[issueData['issueKey']] = issueData;
              size++;
            });
            issueCount -= size;
          })
          .catch((e => {
            this.$message({
              message: '課題を取得できませんでした',
              type: 'warning'
            });
            console.log(e);
          }));

        while (issueCount > 0) {
          // 次の結果の条件を設定する
          let startDate = '';
          for (let key in issueList) {
            startDate = (!startDate || issueList[key].startDate > startDate) ? issueList[key].startDate : startDate;
          }
          searchStartDate = startDate ? '&startDateSince=' + startDate.substring(0, 10) : '';

          url = `https://${localStorage.spaceName}.backlog.jp/api/v2/issues?apiKey=${localStorage.token}&projectId[]=${this.$store.state.projectId}&milestoneId[]=${this.$store.state.milestoneId}&count=${getSize}${searchStartDate}&sort=startDate&order=asc`;

          await this.$axios.$get(url)
            .then((res) => {
              let size = 0;
              res.forEach(issueData => {
                issueList[issueData['issueKey']] = issueData;
                size++;
              });
              issueCount -= size;
            })
            .catch((e => {
              this.$message({
                message: '課題を取得できませんでした',
                type: 'warning'
              });
              console.log(e);
            }));
        }

        return issueList;
      },
      format: function (issueData) {
//TODO 実装
      }
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
    font-weight: bold;
    font-size: 40px;
    color: #35495e;
    letter-spacing: 1px;
    margin: 30px 0;
  }
</style>
