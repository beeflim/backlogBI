<script>
export default {
  methods: {
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
    }
  }
};
</script>