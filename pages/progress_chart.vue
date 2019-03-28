<template>
  <section class="line-container">
    <div>
      <h1 class="line-title">
        [{{ $store.state.chartName }}] {{ $store.state.projectName }} - {{ $store.state.milestoneName }}
      </h1>
      <div style="width: 90%;">
        <LineChart :data="writeLineChart()" :options="lineOptions()"></LineChart>
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
    props: {
      labels: [],
      estimatedData: [],
      finishedData: []
    },
    async mounted() {
      let issueData = await this.getAllIssueData();
      issueData = this.format(issueData);
    },
    methods: {
      writeLineChart: function () {

        return {
          labels: this.$props.labels,
          datasets: [
            {
              label: "完了 工数(時)",
              borderColor:'rgba(86,167,100,1)',
              backgroundColor:'rgba(86,167,100,0.1)',
              borderWidth:'3',
              pointBackgroundColor:'rgba(186,267,200,1)',
              pointBorderColor:'rgba(86,167,100,1)',
              data: this.$props.finishedData
            },
            {
              label: "予定 工数(時)",
              borderColor:'rgba(204,82,139,1)',
              backgroundColor:'rgba(204,82,139,0.1)',
              borderWidth:'3',
              pointBackgroundColor:'rgba(1204,82,139,1)',
              pointBorderColor:'rgba(204,82,139,1)',
              data: this.$props.estimatedData
            }
          ]
        }
      }, lineOptions: function () {
        return {}
      },
      getIssueData: async function (issueList) {

        //一度に課題の数
        let getSize = 100;

        // 開始日が最新の物を取得する
        let dueDate = '';
        if (issueList) {
          for (let key in issueList) {
            dueDate = (!dueDate || issueList[key].dueDate > dueDate) ? issueList[key].dueDate : dueDate;
          }
        }

        // 検索条件を設定する。
        let searchStartDate = dueDate ? '&dueDateSince=' + dueDate.substring(0, 10) : '';

        // チケット情報を取得するURLを作成する
        let url = `https://${localStorage.spaceName}.backlog.jp/api/v2/issues?apiKey=${localStorage.token}&projectId[]=${this.$store.state.projectId}&milestoneId[]=${this.$store.state.milestoneId}&count=${getSize}${searchStartDate}&sort=dueDate&order=asc`;

        // 取得したticket件数
        let size = 0;

        await this.$axios.$get(url)
          .then((res) => {
            res.forEach(issueData => {
              issueList[issueData['issueKey']] = issueData;
              size++;
            });
          })
          .catch((e => {
            this.$message({
              message: '課題を取得できませんでした',
              type: 'warning'
            });
            console.log(e);
          }));

        return size;
      },
      getAllIssueData: async function () {
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
       * chartようにデータを成型する
       * @param issueData APIで取得した課題データ
       */
      format: function (issueData) {
        let labels = [];

        // 予定データ
        let estimatedData = [];
        let estimatedSize = 0;

        // 完了データ
        let finishedData = [];
        let finishSize = 0;

        //完了日が未設定野場合
        let unSetestimatedSize = 0;
        let unSetfinishSize = 0;
        let hasUnSetData = false;

        Object.keys(issueData).forEach(function (key) {
          // 完了日が設定されている場合
          if (issueData[key].dueDate) {
            // ラベルの設定
            let hasLabel = false;
            let labelName = issueData[key].dueDate.substring(5, 10).replace(/-/g, '/')

            if (labels.indexOf(labelName) >= 0){
              hasLabel = true;
            }else{
              hasLabel = false;
              labels.push(labelName );
            }


            // 予定工数を登録
            estimatedSize += issueData[key].estimatedHours;
            if(hasLabel){
              estimatedData[estimatedData.length -1] = Math.round(estimatedSize * 100) / 100;
            }else {
              estimatedData.push(Math.round(estimatedSize * 100) / 100);
            }

            // 完了工数を登録
            finishSize += issueData[key].actualHours;
            if (issueData[key].status.name === '完了') {
              if(hasLabel){
                finishedData[finishedData.length -1] = finishSize;
              }else {
                finishedData.push(Math.round(finishSize * 100) / 100);
              }
            }
          } else {
            // 未設定の時
            unSetestimatedSize += issueData[key].estimatedHours;
            unSetfinishSize += issueData[key].actualHours;
            hasUnSetData = true;
          }

        });

        // 未設定がある場合
        if (hasUnSetData) {
          labels.push('未設定');
          estimatedData.push(Math.round(unSetestimatedSize + estimatedSize * 100) / 100);
          finishedData.push(Math.round(unSetfinishSize + finishSize * 100) / 100);
        }

        this.$props.labels = labels;
        this.$props.estimatedData = estimatedData;
        this.$props.finishedData = finishedData;

      }
    }
  }

</script>

<style>
  .line-container {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .line-title {
    font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
    display: block;
    font-weight: bold;
    font-size: 30px;
    color: #35495e;
    letter-spacing: 1px;
  }
</style>
