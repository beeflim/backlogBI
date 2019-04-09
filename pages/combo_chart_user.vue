<template>

  <section class="line-container">
    <div style="width: 100%">
      <h1
        class="line-title"
      >[{{ $store.state.chartName }}] {{ $store.state.projectName }} <br> {{ $store.state.milestoneName }}
      </h1>

      <div v-for="lineData in user" :key="lineData.name">
        <div class="line-chart">
          <h2 class="line-title__sub">{{lineData.name}}</h2>
          <div class="line-analysis">
            <table class="line-analysis-table">
              <tr>
                <th>ベロシティ</th>
                <td><span>1(+0.5)</span></td>
              </tr>
              <tr>
                <th>実績（予実）</th>
                <td><span>10時間</span></td>
              </tr>
              <tr>
                <th>チケット消化</th>
                <td><span>よろしくない</span></td>
              </tr>
              <tr>
                <th style="border: none;" rowspan="2">総評</th>
                <td><span>危険</span></td>
              </tr>
              <tr>
                <td><span>作業効率が落ち、残業業もこなしているが、チケットの消化が追いついていない。</span></td>
              </tr>
            </table>
          </div>

          <BarChart :data="writeLineChart(lineData)" :options="lineOptions()" class="line-chart-chart"></BarChart>
          <div class="line-chart-money">
            <el-table
              :data="lineData.data.tableData"
              style="width: 100%">
              <el-table-column
                prop="title"
                label=""
                width="180">
              </el-table-column>
              <el-table-column
                prop="estimatedMoney"
                label="予定金額"
                width="180">
              </el-table-column>
              <el-table-column
                prop="finishedMoney"
                label="完了金額"
                width="180">
              </el-table-column>
              <el-table-column
                prop="difference"
                label="差額">
              </el-table-column>
            </el-table>
          </div>
        </div>

      </div>
    </div>

  </section>
</template>

<script>
  import BarChart from "@/components/chart/BarChart.vue";
  import ReadIssueData from "@/components/methods/ReadIssueData.vue";
  import FormatBarData from "@/components/methods/FormatBarData.vue";
  import ReadUserData from "@/components/methods/ReadUserData.vue";

  export default {
    mixins: [ReadIssueData, FormatBarData, ReadUserData],
    components: {
      BarChart
    },
    data() {
      return {
        user: []
      };
    },

    async mounted() {
      //ユーザーの一覧を取得する
      //ユーザーデータを取得する
      let userData = await this.getProjectUsers(this.$store.state.projectId);
      //ユーザーごとの課題を取得する
      (async () => {
        for (let user of userData) {
          let issueData = await this.getAllIssueData(user.id);
          let formatedData = this.formatBarUp(issueData);
          let formatedBarData = this.formatBouGraph(issueData);

          let nowData = new Date();

          let todayIndex = formatedData.labels.indexOf(`${nowData.getMonth() + 1}/${nowData.getDate()}`);
          let barEstimatedData = [];
          let barFinishData = [];
          let barFinishFutureData = [];

          for (let i = 0; i < formatedData.labels.length; i++) {
            barEstimatedData.push((i === todayIndex) ? formatedBarData.estimatedSize : 0);
            barFinishFutureData.push((i === todayIndex) ? formatedBarData.finishedFutureSize : 0);

            if (i === todayIndex) {
              if (formatedBarData.finishedFutureSize > 0) {
                barFinishData.push(formatedBarData.finishedSize - formatedBarData.finishedFutureSize);
              } else {
                barFinishData.push(formatedBarData.finishedSize);
              }
            } else {
              barFinishData.push(0);
            }

            if (formatedData !== 0) {
              if (formatedData.labels.length !== 0) {
                //各フォーマットされたデータを設定
                this.user.push({
                    name: user.name,
                    data: {
                      labels: formatedData.labels,
                      estimatedData: formatedData.estimatedData,
                      finishedData: formatedData.finishedData,
                      safetyLine: formatedData.safetyLine,
                      warningLine: formatedData.warningLine,
                      maxLine: formatedData.maxLine,
                      expectData: formatedData.expectData,
                      barEstimatedData: barEstimatedData,
                      barFinishData: barFinishData,
                      barFinishFutureData: barFinishFutureData,
                      tableData: this.createTableData(formatedData)
                    }
                  }
                );
              }
            }
          }
        }
      }
      )();

    }
    ,
    methods: {
      /**
       * チャートの色などを指定する
       */
      writeLineChart: function (lineData) {
        let nowDate = new Date();
        return {
          labels: lineData.data.labels,
          datasets: [
            {
              label: "予定 工数(時)",
              borderColor: "rgba(182,182,182,1)",
              backgroundColor: "rgba(182,182,182,0.1)",
              fill: false,
              borderWidth: "3",
              pointStyle: "dotted",
              pointBackgroundColor: "rgba(182,182,182,1)",
              pointBorderColor: "rgba(182,182,182,1)",
              data: lineData.data.estimatedData,
              type: "line"
            },
            {
              label: "完了 工数(時)",
              borderColor: "rgba(86,167,100,1)",
              backgroundColor: "rgba(86,167,100,0.1)",
              borderWidth: "3",
              fill: false,
              pointStyle: "dotted",
              pointBackgroundColor: "rgba(186,267,200,1)",
              pointBorderColor: "rgba(86,167,100,1)",
              data: lineData.data.finishedData,
              type: "line"
            },
            {
              label: "予定 工数(時)",
              borderColor: "rgba(182,182,182,1)",
              backgroundColor: "rgba(182,182,182,0.1)",
              borderWidth: "3",
              data: lineData.data.barEstimatedData
            },
            {
              label: `完了 工数(時)(${nowDate.getMonth() + 1}/${nowDate.getDate()})以前`,
              borderColor: "rgba(86,167,100,1)",
              backgroundColor: "rgba(86,167,100,0.1)",
              borderWidth: "3",
              data: lineData.data.barFinishData
            },
            {
              label: `完了 工数(時)(${nowDate.getMonth() + 1}/${nowDate.getDate()})以降`,
              borderColor: "rgba(33, 144, 255,1)",
              backgroundColor: "rgba(33, 144, 255,0.1)",
              borderWidth: "3",
              data: lineData.data.barFinishFutureData
            }
          ]
        };
      }
      ,
      lineOptions: function () {
        return {};
      }
    }
  }
  ;
</script>

<style>
  .line-container {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .line-title {
    font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
    display: inline;
    font-weight: bold;
    font-size: 24px;
    color: #35495e;
    letter-spacing: 1px;
  }

  .line-chart {
    margin-top: 45px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    /*align-items: center;*/

  }

  .line-title__sub {
    font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
    font-weight: bold;
    color: #35495e;
    letter-spacing: 1px;
    font-size: 32px;
    width: 30%;
  }

  .line-analysis {
    font-size: 16px;
    width: 70%;
  }

  .line-chart-chart {
    width: 46%;
    margin-top: 20px;
  }

  .line-chart-money {
    width: 46%;
    margin-top: 20px;
  }

  .line-analysis-table {
    border: solid 5px rgba(33, 144, 255,1);
    cellspacing: 0;
    cellpadding: 0;
  }

  .line-analysis-table th {
    border-bottom: solid 3px rgba(33, 144, 255,1);
  }

  .line-analysis-table td {
    border-bottom: solid 3px rgba(33, 144, 255,1);
    text-align: left;
  }

  .line-analysis-table td span {
    margin-left: 20px;
    font-weight: normal;
  }

  .line-analysis-table tr:last-child th,
  .line-analysis-table tr:last-child td {
    border-bottom: none;
  }

</style>
