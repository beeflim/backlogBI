<script>
  export default {
    methods: {
      /**
       * メインとなるデータを作成する
       * @param issueData
       */
      formatBarUpMainData: function (issueData) {
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
        let expectComp = 1;

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
              labelDateSince = new Date(due[0], due[1] - 1, due[2]);
              labelworkSince = new Date(due[0], due[1] - 1, due[2]);
            }
            labelDateUntil = new Date(due[0], due[1] - 1, due[2]);
          }
        });

        //ラベルデータがないと処理が行えないので、スキップするようにする。
        // ラベルなしは未設定として登録したいので、このようにする
        let hasLabelData = labelDateSince && labelDateUntil;

        // 現在日付がマイルストーン内にあるかどうかを判定
        let isDoingProject = false;
        if (hasLabelData) {
          // 現在日がラベルに入るようにする。
          // ただし、最終日が過ぎていないことを条件とする
          let targetDate = new Date();
          if (labelDateUntil > targetDate) {

            while (targetDate > labelDateSince) {
              isDoingProject = true;
              targetDate.setDate(targetDate.getDate() - LABEL_WIDTH);
            }
            labelDateSince = targetDate;
          }

          labelDateUntil.setDate(labelDateUntil.getDate() + LABEL_WIDTH);

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
                let targetDate = new Date(a[0], a[1] - 1, a[2]);
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
                    } else if (expectComp < 0.5) {
                      expectComp = 0.5;
                    }
                  } else {
                    //予想データを加算
                    expectSize += values.estimatedHours * expectComp;
                  }

                  hasfinishData = hasfinishData || values.actualHours;

                  //ラベルをベースに工数を累積していく
                  if (
                    labels.indexOf((xDate.getMonth() + 1) + "/" + xDate.getDate()) === -1
                  ) {
                    labels.push((xDate.getMonth() + 1) + "/" + xDate.getDate());
                  }
                }
              }
            });
            estimatedData.push(Math.round(estimatedSize * 100) / 100);
            finishedData.push(Math.round(finishSize * 100) / 100);
            expectData.push(Math.round(expectSize * 100) / 100);

            estimatedSize = 0;
            finishSize = 0;
            expectSize = 0;
            expectComp = 0;
          }

          //工数の値を設定する
          estimatedSize = estimatedData[estimatedData.length - 1];
          finishSize = finishedData[finishedData.length - 1];
        }
        //未設定の分を取得する
        Object.keys(issueData).forEach(function (key) {
          if (!issueData[key].dueDate) {
            // 未設定の時
            unSetestimatedSize += issueData[key].estimatedHours;
            unSetfinishSize += issueData[key].actualHours;
            hasUnSetData = true;
          }
        });

        if (hasLabelData) {
          // 日付が初期の物を作成する
          labelworkSince.setDate(labelworkSince.getDate() - LABEL_WIDTH);
          labels.unshift(
            (labelworkSince.getMonth() + 1) + "/" + labelworkSince.getDate()
          );
          if (!isDoingProject) {
            estimatedData.unshift(0);
            finishedData.unshift(0);
            expectData.unshift(0);
          }
        }

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
      formatBarUpSupportData: function (labels, estimatedData, finishedData) {
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
        const BASE_NUM = estimatedData[estimatedData.length - 1] / 3;
        const WARN_BASE_NUM = estimatedData[estimatedData.length - 1] / 8;

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
        const MAX_NUM_BASE = 20;
        maxNum = Math.floor(maxNum / MAX_NUM_BASE) * MAX_NUM_BASE + MAX_NUM_BASE;
        maxNum =
          warningLine[warningLine.length - 1] > maxNum
            ? warningLine[warningLine.length - 1] + MAX_NUM_BASE
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
       * バーアップ用のデータに整形する。
       * 予定、実績、予想、安全、危険、ラベルを返す
       *
       * @param issueData APIで取得した課題データ
       */
      formatBarUp: function (issueData) {
        //メインデータを取得する
        let mainData = this.formatBarUpMainData(issueData);
        if (mainData === 0) {
          return 0;
        }
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
        let supportData = this.formatBarUpSupportData(
          labels,
          estimatedData,
          finishedData
        );

        let safetyLine = supportData.safetyLine;
        let warningLine = supportData.warningLine;
        let maxLine = supportData.maxLine;

        return {
          labels: labels,
          estimatedData: estimatedData,
          finishedData: finishedData,
          safetyLine: safetyLine,
          warningLine: warningLine,
          maxLine: maxLine,
          expectData: expectData
        };
      },
      /**
       * 課題の棒グラフを表示するように課題データを整形する
       * @param issueData 課題データ
       */
      formatBouGraph: function (issueData) {

        let nowDate = new Date();

        let estimatedSize = 0;
        let finishedSize = 0;

        Object.values(issueData).forEach(issue => {
          if (issue.dueDate) {
            //現在日までの予定工数の合計
            let due = issue.dueDate.substring(0, 10).split('-');
            let dueDate = new Date(due[0], due[1] - 1, due[2]);
            if (dueDate <= nowDate) {
              estimatedSize += issue.estimatedHours;
            }
          }
          //現在の完了工数
          if (issue.status.name === "完了") {
            finishedSize += issue.actualHours;
          }
        });

        return {
          estimatedSize: Math.round(estimatedSize * 100) / 100,
          finishedSize: Math.round(finishedSize * 100) / 100
        };
      }
    }
  };
</script>
