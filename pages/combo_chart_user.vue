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
            <table class="line-analysis-table" :class="lineData.data.analyzeData.status">
              <tr>
                <th><span>ベロシティ</span></th>
                <td><span>
                  {{lineData.data.analyzeData.velocity}}
                </span></td>
              </tr>
              <tr>
                <th><span>残業時間（実績 / 予実）</span></th>
                <td><span>{{lineData.data.analyzeData.finishedSize - lineData.data.analyzeData.estimatedSize}} ( {{lineData.data.analyzeData.finishedSize}} / {{lineData.data.analyzeData.estimatedSize}} )</span>
                </td>
              </tr>
              <tr>
                <th><span>チケット消化（実績 / 予実）</span></th>
                <td><span>{{lineData.data.analyzeData.barFinishedTicketSize}} / {{lineData.data.analyzeData.barEstimatedTicketSize}}</span>
                </td>
              </tr>
              <tr>
                <th style="border: none;" rowspan="2">総評</th>
                <td><span>{{lineData.data.analyzeData.totalMessage}}</span></td>
              </tr>
              <tr>
                <td><span>{{lineData.data.analyzeData.velocityMessage}}</span></td>
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
            //分析データを作成
            let analyzeData = await this.formatAnalyzeData(formatedBarData);

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
                      tableData: this.createTableData(formatedData),
                      analyzeData: analyzeData
                    }
                  }
                );
              }
            }

          }
        }
      )();

    }
    ,
    methods: {
      formatAnalyzeData: async function (formatedBarData) {
        //現在の作業時間
        let estimatedSize = formatedBarData.estimatedSize;
        let finishedSize = (formatedBarData.finishedFutureSize > 0)
          ? formatedBarData.finishedSize - formatedBarData.finishedFutureSize
          : formatedBarData.finishedSize;
        const TIME_LIMIT_WARN = 8;
        let timeAnalyze = 0;
        if ( finishedSize <= estimatedSize) {
          timeAnalyze = 0;
        } else if (finishedSize - estimatedSize < TIME_LIMIT_WARN) {
          timeAnalyze = 1;
        } else {
          timeAnalyze = 2
        }
        //ベロシティ
        const VELOCITY_LIMIT_WARN = 1.3;
        let velocityAnalyze = 0;
        let velocity = Math.round((estimatedSize / finishedSize) * 100) / 100;
        if (velocity <= 0) {
          velocityAnalyze = 0
        } else if (velocity < VELOCITY_LIMIT_WARN) {
          velocityAnalyze = 1
        } else {
          velocityAnalyze = 2
        }

        //残チケット
        let barEstimatedTicketSize = formatedBarData.estimatedTicketSize;
        let barFinishedTicketSize = formatedBarData.finishedTicketSize - formatedBarData.finishedTicketFuterSize;
        let barFinishedTicketFuturSize = formatedBarData.finishedTicketFuterSize;
        let ticketAnalyze = 0;
        if (barEstimatedTicketSize === barFinishedTicketSize) {
          ticketAnalyze = 0;
        } else if (barEstimatedTicketSize >= barFinishedTicketSize + barFinishedTicketFuturSize && barFinishedTicketSize !== 0) {
          ticketAnalyze = 1;
        } else {
          ticketAnalyze = 2;
        }

        let analyzeList = this.createAnalyzeMessage(timeAnalyze, velocityAnalyze, ticketAnalyze);
        analyzeList['velocity'] = velocity;
        analyzeList['barEstimatedTicketSize'] = barEstimatedTicketSize;
        analyzeList['barFinishedTicketSize'] = barFinishedTicketSize;
        analyzeList['estimatedSize'] = estimatedSize;
        analyzeList['finishedSize'] = finishedSize;

        return analyzeList;
      },
      /**
       * アナライズ情報から総評の文字を作成する
       * @param timeAnalyze
       * @param velocityAnalyze
       * @param ticketAnalyze
       */
      createAnalyzeMessage: function (timeAnalyze, velocityAnalyze, ticketAnalyze) {
        let velocityMessage = '';
        let totalMessage = '';

        switch (velocityAnalyze) {
          case 0:
            velocityMessage = '作業スピードは順調です。';
            break;
          case 1:
            velocityMessage = 'ベロシティが少し上がっています。今後、残業が発生する可能性が高いです。';
            break;
          case 2:
          default:
            velocityMessage = 'ベロシティが上がっています。今後、作業遅延が発生する可能性が高いです。';
        }

        let status = 'line-analysis-table__good';
        switch (timeAnalyze) {
          case 0:
            switch (ticketAnalyze) {
              case 0:
                totalMessage = '問題なく、残業なしでチケットも消化しています。';
                status = 'line-analysis-table__good';
                break;
              case 1:
                totalMessage = `残業がない状態で完了していないチケットがあり、前倒しで終わらせているチケットがあります。
次のスプリントの予定を確認する必要があります。`;
                status = 'line-analysis-table__warn';
                break;
              case 2:
              default:
                totalMessage = `残業がない状態で完了していないチケットがあります。
次のスプリントの予定を確認する必要があります。`;
                status = 'line-analysis-table__danger';
            }
            break;
          case 1:
            switch (ticketAnalyze) {
              case 0:
                totalMessage = `多少の残業をしてチケットを消化しています。
ベロシティに注意して次の作業をしてください。`;
                status = 'line-analysis-table__good';
                break;
              case 1:
                totalMessage = `残業をしていますがチケットを消化しきれていません。
前倒しで終わらせている作業があるので、次のスプリントの予定を確認してください。`;
                status = 'line-analysis-table__warn';
                break;
              case 2:
              default:
                totalMessage = `至急：残業をしていますがチケットを消化しきれていません。
遅延の原因確認と次のスプリントの予定を確認してください。`;
                status = 'line-analysis-table__danger';
            }
            break;
          case 2:
          default:
            switch (ticketAnalyze) {
              case 0:
                totalMessage = `至急：多くの残業をしてチケットを消化しています。
スケジュールの確認や、他のメンバーによるヘルプができないか確認してください。`;
                status = 'line-analysis-table__warn';
                break;
              case 1:
                totalMessage = `至急：多くの残業をしていますがチケットを消化し切れていません。
前倒しで作業を終わらせているものがあるので、作業順・スケジュールの確認、他のメンバーからのヘルプができないか確認してください。`;
                status = 'line-analysis-table__danger';
                break;
              case 2:
              default:
                totalMessage = `至急：多くの残業をしていますがチケットを消化し切れていません。
作業順・スケジュールの確認、他のメンバーからのヘルプができないか確認してください。`;
                status = 'line-analysis-table__danger';
            }
        }

        return {
          velocityMessage: velocityMessage,
          totalMessage: totalMessage,
          status: status
        };
      },
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
    line-height: 4;
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
    border: solid 6px rgba(89, 89, 89, 1);
    background-color: rgba(89, 89, 89, 0.1);
    border-spacing: 0;
    border-collapse: 0;
    border-radius: 3px;
  }

  .line-analysis-table th {
    width: 205px;
    border-bottom: solid 3px rgba(89, 89, 89, 1);
  }

  .line-analysis-table th span {
    margin: 3px;
  }

  .line-analysis-table td {
    border-bottom: solid 3px rgba(89, 89, 89, 1);
    text-align: left;
    padding: 5px 0;

  }

  .line-analysis-table tr:first-child td span {
    white-space: normal;
  }
  .line-analysis-table td span {
    font-weight: normal;
    margin: 3px 3px 3px 5px;
    white-space: pre-wrap;
    word-wrap: break-word
  }

  .line-analysis-table tr:last-child th,
  .line-analysis-table tr:last-child td {
    border-bottom: none;
  }

  .line-analysis-table__good {
    border: solid 6px rgba(33, 144, 255, 1) !important;
    background-color: rgba(33, 144, 255, 0.1) !important;
  }

  .line-analysis-table__good td, .line-analysis-table__good th {
    border-bottom: solid 3px rgba(33, 144, 255, 1) !important;
  }

  .line-analysis-table__warn {
    border: solid 6px rgba(255, 244, 26, 1) !important;
    background-color: rgba(255, 244, 26, 0.3) !important;
  }

  .line-analysis-table__warn td, .line-analysis-table__warn th {
    border-bottom: solid 3px rgba(255, 244, 26, 1) !important;
  }

  .line-analysis-table__danger {
    border: solid 6px rgba(255, 51, 64, 1) !important;
    background-color: rgba(255, 51, 64, 0.3) !important;
  }

  .line-analysis-table__danger td, .line-analysis-table__danger th {
    border-bottom: solid 3px rgba(255, 51, 64, 1) !important;
  }
</style>
