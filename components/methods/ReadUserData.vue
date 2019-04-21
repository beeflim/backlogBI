<script>
  export default {
    methods: {
      /**
       * プロジェクトに参加しているユーザーの情報を取得する
       * @param projectId 検索するプロジェクトID
       * @returns {Promise<Array>}　結果
       */
      getProjectUsers: async function (projectId) {
        let url =
          `https://${localStorage.spaceName}.backlog.jp` +
          `/api/v2/projects/${projectId}/users` +
          `?apiKey=${localStorage.token}`;


        let userList = [];

        await this.$axios
          .$get(url)
          .then(res => {
            res.forEach(userData => {
              userList.push(userData);
            });
          })
          .catch(e => {
            this.$message({
              message: "プロジェクトユーザーを取得できませんでした",
              type: "warning"
            });
            console.log(e);
          });
        return userList;
      }
    }
  };
</script>
