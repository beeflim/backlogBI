<template>
  <section class="line-container">
    <div>
      <h1
        class="line-title"
      >[{{ $store.state.chartName }}] {{ $store.state.projectName }} - {{ $store.state.milestoneName }}</h1>
      <div class="line-chart">
        <LineChart :data="writeLineChart()" :options="lineOptions()"></LineChart>
      </div>
    </div>
  </section>
</template>

<script>
import AppLogo from "~/components/AppLogo.vue";
import LineChart from "@/components/chart/LineChart.vue";

export default {
  components: {
    AppLogo,
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
      labels: this.p_labels,
      estimatedData: this.p_estimatedData,
      finishedData: this.p_finishedData,
      safetyLine: this.p_safetyLine,
      warningLine: this.p_warningLine,
      maxLine: this.p_maxLine,
      expectData: this.p_expectData
    };
  },
  async mounted() {
    let issueData = await this.getAllIssueData();
    issueData = this.format(issueData);
  },
  methods: {
    /**
     * チャートの色などを指定する
     */
    writeLineChart: function() {
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
    lineOptions: function() {
      return {};
    },
    /**
     * 課題データを取得する。
     * 100件までしか取得できない。
     */
    getIssueData: async function(issueList) {
      //一度に課題の数
      let getSize = 100;

      // 開始日が最新の物を取得する
      let dueDate = "";
      if (issueList) {
        for (let key in issueList) {
          dueDate =
            !dueDate || issueList[key].dueDate > dueDate
              ? issueList[key].dueDate
              : dueDate;
        }
      }
      // 検索条件を設定する。
      let searchStartDate = dueDate
        ? "&dueDateSince=" + dueDate.substring(0, 10)
        : "";

      // チケット情報を取得するURLを作成する
      let url = `https://${
        localStorage.spaceName
      }.backlog.jp/api/v2/issues?apiKey=${localStorage.token}&projectId[]=${
        this.$store.state.projectId
      }&milestoneId[]=${
        this.$store.state.milestoneId
      }&count=${getSize}${searchStartDate}&sort=dueDate&order=asc`;

      // 取得したticket件数
      let size = 0;

      await this.$axios
        .$get(url)
        .then(res => {
          res.forEach(issueData => {
            issueList[issueData["issueKey"]] = issueData;
            size++;
          });
        })
        .catch(e => {
          this.$message({
            message: "課題を取得できませんでした",
            type: "warning"
          });
          console.log(e);
        });

      return size;
    },
    /**
     * 課題データを取得する。
     * マイルストーンに設定されているものすべてを取得
     */
    getAllIssueData: async function() {
      // 課題の件数
      let issueCount = this.$store.state.issueCount;

      // 課題のリスト
      let issueList = {};

      while (issueCount > 0) {
        let fetchSize = await this.getIssueData(issueList);
        issueCount -= fetchSize;
      }

      return issueList;
    },
    /**
     * メインとなるデータを作成する
     * @param issueData
     */
    formatMainData: function(issueData) {
      let labels = [];

      // 予定データ
      let estimatedData = [];
      // 累積用に使う
      let estimatedSize = 0;

      // 完了データ
      let finishedData = [];
      // 累積用に使う
      let finishSize = 0;

      // 予想データ
      let expectData = [];
      let expectSize = 0;
      let expectComp = 0;

      //完了日が未設定の場合は、値を纏める。
      let unSetestimatedSize = 0;
      let unSetfinishSize = 0;
      let hasUnSetData = false;

      //ラベルの幅をこの値毎にする
      const LABEL_WIDTH = 5;

      let labelDateSince = "";
      let labelworkSince = "";
      let labelDateUntil = "";

      // ticketの最小最大の終了日を取得する
      Object.keys(issueData).forEach(key => {
        if (issueData[key].dueDate) {
          let due = issueData[key].dueDate.substring(0, 10).split("-");
          if (!labelDateSince) {
            labelDateSince = new Date(due[0], due[1], due[2]);
            labelworkSince = new Date(due[0], due[1], due[2]);
          }
          labelDateUntil = new Date(due[0], due[1], due[2]);
        }
      });
      labelDateUntil.setDate(labelDateUntil.getDate() + LABEL_WIDTH);

      let differenceLime = [];
      //LABEL_WIDTH毎にチケットデータを纏める
      for (
        let xDate = labelDateSince;
        xDate < labelDateUntil;
        xDate.setDate(xDate.getDate() + LABEL_WIDTH)
      ) {
        let hasfinishData = false;
        Object.values(issueData).forEach(values => {
          if (values.dueDate) {
            let a = values.dueDate.substring(0, 10).split("-");
            let targetDate = new Date(a[0], a[1], a[2]);
            //課題の日付がX軸よりも小さい時
            if (targetDate <= xDate) {
              //予定データを加算
              estimatedSize += values.estimatedHours;
              //完了データを加算
              if (values.status.name === "完了") {
                finishSize += values.actualHours;
                expectSize += values.actualHours;

                // 完了の時、予定よりどのぐらいの倍率で完了したかを計算する
                expectComp =
                  Math.round(
                    ((values.actualHours / values.estimatedHours + expectComp) /
                      2) *
                      100
                  ) / 100;
                if (expectComp > 1.5) {
                  expectComp = 1.5;
                } else if (expectComp != 0 && expectComp < 0.5) {
                  expectComp = 0.5;
                }
              } else {
                //予想データを加算
                expectSize += values.estimatedHours * expectComp;
              }

              hasfinishData =
                hasfinishData || values.actualHours ? true : false;

              //ラベルをベースに工数を累積していく
              if (
                labels.indexOf(xDate.getMonth() + "/" + xDate.getDate()) === -1
              ) {
                labels.push(xDate.getMonth() + "/" + xDate.getDate());
              }
            }
          }
        });

        estimatedData.push(Math.round(estimatedSize * 100) / 100);
        if (hasfinishData) {
          finishedData.push(Math.round(finishSize * 100) / 100);
        }
        expectData.push(Math.round(expectSize * 100) / 100);

        differenceLime.push(
          Math.round(finishSize * 100) / 100 -
            Math.round(estimatedSize * 100) / 100
        );

        estimatedSize = 0;
        finishSize = 0;
        expectSize = 0;
        expectComp = 0;
      }

      //工数の値を設定する
      estimatedSize = estimatedData[estimatedData.length - 1];
      finishSize = finishedData[finishedData.length - 1];

      //未設定の分を取得する
      Object.keys(issueData).forEach(function(key) {
        if (!issueData[key].dueDate) {
          // 未設定の時
          unSetestimatedSize += issueData[key].estimatedHours;
          unSetfinishSize += issueData[key].actualHours;
          hasUnSetData = true;
        }
      });

      // 日付が初期の物を作成する
      labelworkSince.setDate(labelworkSince.getDate() - LABEL_WIDTH);
      labels.unshift(
        labelworkSince.getMonth() + "/" + labelworkSince.getDate()
      );
      estimatedData.unshift(0);
      finishedData.unshift(0);
      expectData.unshift(0);

      return {
        labels: labels,
        estimatedData: estimatedData,
        estimatedSize: estimatedSize,
        finishedData: finishedData,
        finishSize: finishSize,
        unSetestimatedSize: unSetestimatedSize,
        unSetfinishSize: unSetfinishSize,
        hasUnSetData: hasUnSetData,
        expectData: expectData,
        expectSize: expectSize,
        expectComp: expectComp
      };
    },
    /**
     * 安全、危険のラインを引く
     * @param labels
     * @param estimatedData
     * @param finishedData
     */
    formatSupportData: function(labels, estimatedData, finishedData) {
      let safetyLine = [];
      let warningLine = [];
      let maxLine = [];
      this.$data.test = "フォーマットで変更した";
      // 安全性を示す直線を作成する
      let magnification = Math.round(
        estimatedData[estimatedData.length - 1] / labels.length
      );

      //安全性の曲線の初期値
      //TODO 要調整
      const BASE_NUM = 20; //estimatedData[estimatedData.length - 1] / 3;
      const WARN_BASE_NUM = 20; ///estimatedData[estimatedData.length - 1] / 8;

      //安全性と危険性のラインを作成する。
      for (let i = 0; i < labels.length; i++) {
        let safeNum = magnification * i - BASE_NUM;

        safetyLine.push(safeNum > 0 ? safeNum : 0);
        warningLine.push(magnification * i + WARN_BASE_NUM);
      }

      //危険性のfillを出すために、上部にラインを作成する
      let maxNum =
        estimatedData[estimatedData.length - 1] >
        finishedData[finishedData.length - 1]
          ? estimatedData[estimatedData.length - 1]
          : finishedData[finishedData.length - 1];

      //TODO 要調整
      maxNum = Math.floor(maxNum / 20) * 20 + 20;
      maxNum =
        warningLine[warningLine.length - 1] > maxNum
          ? warningLine[warningLine.length - 1]
          : maxNum;
      labels.forEach(() => {
        maxLine.push(maxNum);
      });

      return {
        safetyLine: safetyLine,
        warningLine: warningLine,
        maxLine: maxLine
      };
    },
    /**
     * chartで表示ができるようにデータを成型する
     * @param issueData APIで取得した課題データ
     */
    format: function(issueData) {
      //メインデータを取得する
      let mainData = this.formatMainData(issueData);

      let labels = mainData.labels;

      let estimatedData = mainData.estimatedData;
      let estimatedSize = mainData.estimatedSize;

      let finishSize = mainData.finishSize;
      let finishedData = mainData.finishedData;

      let unSetestimatedSize = mainData.unSetestimatedSize;
      let unSetfinishSize = mainData.unSetfinishSize;
      let hasUnSetData = mainData.hasUnSetData;

      let expectData = mainData.expectData;
      let expectSize = mainData.expectSize;
      let expectComp = mainData.expectComp;

      // 未設定がある場合
      if (hasUnSetData) {
        labels.push("未設定");
        estimatedData.push(
          Math.round(unSetestimatedSize + estimatedSize * 100) / 100
        );
        finishedData.push(Math.round(unSetfinishSize + finishSize * 100) / 100);
      }

      //supportデータを取得
      let supportData = this.formatSupportData(
        labels,
        estimatedData,
        finishedData
      );

      let safetyLine = supportData.safetyLine;
      let warningLine = supportData.warningLine;
      let maxLine = supportData.maxLine;

      this.$data.labels = labels;
      this.$data.estimatedData = estimatedData;
      this.$data.finishedData = finishedData;
      this.$data.safetyLine = safetyLine;
      this.$data.warningLine = warningLine;
      this.$data.maxLine = maxLine;
      this.$data.expectData = expectData;
    }
  }
};
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
  font-size: 30px;
  color: #35495e;
  letter-spacing: 1px;
}

.line-chart {
  width: 70%;
  margin: 0 auto;
}
</style>
