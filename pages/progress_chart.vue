<template>

  <section class="line-container">
    <div style="width: 60vw">
      <h1
        class="line-title"
      >[{{ $store.state.chartName }}] {{ $store.state.projectName }} <br> {{ $store.state.milestoneName }}
      </h1>
      <div class="line-chart">
        <LineChart :data="writeLineChart()" :options="lineOptions()"></LineChart>
      </div>
      <br>
      <div style="text-align: center;width: 80%; margin: 0 auto;">
        <el-table
          :data="tableData"
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

  </section>
</template>

<script>
  import LineChart from "@/components/chart/LineChart.vue";
  import ReadIssueData from "@/components/methods/ReadIssueData.vue";
  import FormatBarData from "@/components/methods/FormatBarData.vue";

  export default {
    mixins: [ReadIssueData, FormatBarData],
    components: {
      LineChart
    },
    data() {
      return {
        labels: [],
        estimatedData: [],
        finishedData: [],
        safetyLine: [],
        warningLine: [],
        maxLine: [],
        expectData: [],
        tableData: []
      };
    },
    async mounted() {
      //mixin のメソッドを使用してデータを作成します
      let issueData = await this.getAllIssueData();
      let formatedData = this.formatBarUp(issueData,false);
      if (formatedData !== 0) {
        this.$data.labels = formatedData.labels;
        this.$data.estimatedData = formatedData.estimatedData;
        this.$data.finishedData = formatedData.finishedData;
        this.$data.safetyLine = formatedData.safetyLine;
        this.$data.warningLine = formatedData.warningLine;
        this.$data.maxLine = formatedData.maxLine;
        this.$data.expectData = formatedData.expectData;

        this.$data.tableData = this.createTableData(formatedData)

      } else {
        this.$message({
          message:
            "データを出力するには、チケットに開始日、終了日、予定工数、完了工数を入力してください。。",
          type: "warning"
        });
      }

    }
    ,
    methods: {
      /**
       * チャートの色などを指定する
       */
      writeLineChart: function () {
        return {
          labels: this.$data.labels,
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
              data: this.$data.finishedData
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
              data: this.$data.estimatedData
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
              data: this.$data.expectData
            },
            {
              label: "安全性",
              borderColor: "rgba(86,167,100,1)",
              backgroundColor: "rgba(86,167,100,0.1)",
              borderWidth: "1",
              pointStyle: "line",
              fill: "origin",
              pointBorderWidth: 0,
              data: this.$data.safetyLine
            },
            {
              label: "危険性",
              borderColor: "rgba(204,82,139,1)",
              backgroundColor: "rgba(204,82,139,0.1)",
              borderWidth: "1",
              pointStyle: "line",
              fill: 5,
              pointBorderWidth: 0,
              data: this.$data.warningLine
            },
            {
              label: "",
              borderColor: "rgba(204,82,139,1)",
              backgroundColor: "rgba(204,82,139,0.1)",
              borderWidth: "0",
              pointStyle: "line",
              pointBorderWidth: 0,
              fill: false,
              data: this.$data.maxLine
            }
          ]
        };
      },
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
    display: block;
    font-weight: bold;
    font-size: 24px;
    color: #35495e;
    letter-spacing: 1px;
  }

  .line-chart {
    width: 70%;
    margin: 0 auto;
  }
</style>
