<template>

  <section class="line-container">
    <div>
      <h1
        class="line-title"
      >[{{ $store.state.chartName }}] {{ $store.state.projectName }} <br> {{ $store.state.milestoneName }}
      </h1>

      <div v-for="lineData in user" :key="lineData.name">
        <div class="line-chart">
          <h2>{{lineData.name}}</h2>
          <LineChart :data="writeLineChart(lineData)" :options="lineOptions()"></LineChart>
          <br>
          <div style="text-align: center; margin: 0 auto;">
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
  import LineChart from "@/components/chart/LineChart.vue";
  import Vue from "vue";
  import ReadIssueData from "@/components/methods/ReadIssueData.vue";
  import FormatBarData from "@/components/methods/FormatBarData.vue";
  import ReadUserData from "@/components/methods/ReadUserData.vue";

  export default {
    mixins: [ReadIssueData, FormatBarData, ReadUserData],
    components: {
      LineChart
    },
    props: {
      p_labels: [],
      p_estimatedData: [],
      p_finishedData: [],
      p_safetyLine: [],
      p_warningLine: [],
      p_maxLine: [],
      p_expectData: []
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
                      tableData: this.createTableData(formatedData)
                    }
                  }
                );
              }
            }
          }
        }
      )();

      console.log(this.user);
      // //mixin のメソッドを使用してデータを作成します
      // let issueData = await this.getAllIssueData();
      // let formatedData = this.formatBarUp(issueData);
      //
      //   this.$data.tableData = this.createTableData(formatedData)
      //
      // } else {
      //   this.$message({
      //     message:
      //       "データを出力するには、チケットに開始日、終了日、予定工数、完了工数を入力してください。。",
      //     type: "warning"
      //   });
      // }

    }
    ,
    methods: {
      /**
       * チャートの色などを指定する
       */
      writeLineChart: function (lineData) {
        return {
          labels: lineData.data.labels,
          datasets: [
            {
              label: "完了 工数(時)",
              borderColor: "rgba(86,167,100,1)",
              backgroundColor: "rgba(86,167,100,0.1)",
              borderWidth: "3",
              fill: false,
              pointStyle: "dotted",
              pointBackgroundColor: "rgba(186,267,200,1)",
              pointBorderColor: "rgba(86,167,100,1)",
              data: lineData.data.finishedData
            },
            {
              label: "予定 工数(時)",
              borderColor: "rgba(182,182,182,1)",
              backgroundColor: "rgba(182,182,182,0.1)",
              fill: false,
              borderWidth: "3",
              pointStyle: "dotted",
              pointBackgroundColor: "rgba(182,182,182,1)",
              pointBorderColor: "rgba(182,182,182,1)",
              data: lineData.data.estimatedData
            },
            {
              label: "予想 工数(時)",
              borderColor: "rgba(255,82,139,1)",
              backgroundColor: "rgba(255,82,139,0.1)",
              borderWidth: "3",
              pointStyle: "dotted",
              fill: false,
              pointBackgroundColor: "rgba(255,82,139,1)",
              pointBorderColor: "rgba(255,82,139,1)",
              data: lineData.data.expectData
            },
            {
              label: "安全性",
              borderColor: "rgba(86,167,100,1)",
              backgroundColor: "rgba(86,167,100,0.1)",
              borderWidth: "1",
              pointStyle: "line",
              fill: "origin",
              pointBorderWidth: 0,
              data: lineData.data.safetyLine
            },
            {
              label: "危険性",
              borderColor: "rgba(204,82,139,1)",
              backgroundColor: "rgba(204,82,139,0.1)",
              borderWidth: "1",
              pointStyle: "line",
              fill: 5,
              pointBorderWidth: 0,
              data: lineData.data.warningLine
            },
            {
              label: "",
              borderColor: "rgba(204,82,139,1)",
              backgroundColor: "rgba(204,82,139,0.1)",
              borderWidth: "0",
              pointStyle: "line",
              pointBorderWidth: 0,
              fill: false,
              data: lineData.data.maxLine
            }
          ]
        };
      }
      ,
      lineOptions: function () {
        return {};
      }
      ,
      /**
       * 金額表を作成する
       * @param formatedData データ
       * @returns {*[]}
       */
      createTableData: function (formatedData) {
        let nowDate = new Date();
        let indexNum = formatedData.labels.indexOf((nowDate.getMonth() + 1) + '/' + nowDate.getDate());

        let expectMoney = formatedData.expectData[formatedData.expectData.length - 1] * localStorage.hourlySalary * 10000;
        let fullEstimatedMoney = formatedData.estimatedData[formatedData.estimatedData.length - 1] * localStorage.hourlySalary * 10000;
        let estimatedMoney = 0;
        let finishedMoney = 0;
        let title = '';

        if (indexNum < 0) {
          title = '予定金額';
          estimatedMoney = formatedData.estimatedData[formatedData.estimatedData.length - 1] * localStorage.hourlySalary * 10000;
          finishedMoney = formatedData.finishedData[formatedData.finishedData.length - 1] * localStorage.hourlySalary * 10000;

        } else {
          title = `予定金額 (${(nowDate.getMonth() + 1) + '/' + nowDate.getDate()})時点`;
          estimatedMoney = formatedData.estimatedData[indexNum] * localStorage.hourlySalary * 10000;
          finishedMoney = formatedData.finishedData[indexNum] * localStorage.hourlySalary * 10000;
        }

        return [{
          title: title,
          estimatedMoney: estimatedMoney.toLocaleString('ja-JP', {"style": "currency", "currency": "JPY"}),
          finishedMoney: finishedMoney.toLocaleString('ja-JP', {"style": "currency", "currency": "JPY"}),
          difference: (estimatedMoney - finishedMoney).toLocaleString('ja-JP', {
            "style": "currency",
            "currency": "JPY"
          }),
        }, {
          title: '予想金額',
          estimatedMoney: fullEstimatedMoney.toLocaleString('ja-JP', {"style": "currency", "currency": "JPY"}),
          finishedMoney: expectMoney.toLocaleString('ja-JP', {"style": "currency", "currency": "JPY"}),
          difference: (fullEstimatedMoney - expectMoney).toLocaleString('ja-JP', {
            "style": "currency",
            "currency": "JPY"
          }),
        }];
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
    display: block;
    font-weight: bold;
    font-size: 24px;
    color: #35495e;
    letter-spacing: 1px;
  }

  .line-chart {
    margin: 0 auto;
  }
</style>
