<script>
  export default {
    methods: {
      /**
       * 課題データを取得する。
       * 100件までしか取得できない。
       * @param issueList 課題のリスト
       * @param userId 絞り込みたい担当者ID
       * @param fetchSize 一度に取得する課題の数
       */
        getIssueData: async function (issueList, userId, fetchSize) {
        //一度に課題の数
        let getSize = fetchSize;

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

        if (userId) {
          url += `&assigneeId[]=${userId}`;
        }

        console.log('API URL: ' + url);

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
       * @param userId 担当者で絞り込みをしたいときに指定する
       */
      getAllIssueData: async function (userId) {
        // 課題の件数
        let issueCount = this.$store.state.issueCount;

        // 課題のリスト
        let issueList = {};
        const FETCH_SIZE = 100;

        while (issueCount > 0) {
          let fetchSize = await this.getIssueData(issueList, userId, FETCH_SIZE);
          if (userId && (fetchSize === 0 || fetchSize <= FETCH_SIZE)) {
            break;
          }
          console.log('userId:' + userId + ' ,  issueCount:' + issueCount + ',  fetchSize:' + fetchSize);

          issueCount -= fetchSize;
        }

        return issueList;
      }
    }
  };
</script>
