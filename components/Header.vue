<template>
  <el-row>
    <el-col :span="1" class="header-table">
      <div class="header-col">
        <!--<img class="header-col-icon" alt="backlogBI" src="~/assets/images/backlog_icon.png"/> -->
      </div>
    </el-col>
    <el-col :span="3" class="header-table">
      <div class="header-col">Backlog BI</div>
    </el-col>
    <el-col :span="4">
      <div class="header-col header-col__select">
        <el-select v-model="projectId" @change="readMilestone" placeholder="プロジェクトを選択してください">
          <el-option
            v-for="item in projectOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="header-col header-col__select header-col__milestone">
        <el-select v-model="milestoneId" @change="getIssueCount" placeholder="マイルストーンを選択してください">
          <el-option
            v-for="item in milestoneOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
    </el-col>
    <el-col :span="5">
      <div class="header-col header-col__select">
        <el-select :disabled="chartCanUse" v-model="chartId" @change="saveChartId" placeholder="チャートを選択してください">
          <el-option
            v-for="item in chartOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
    </el-col>
    <el-col :span="4">
      <div class="header-col"></div>
    </el-col>
    <el-col :span="1">
      <i @click="dialogFormVisible = true" class="el-icon-more"></i>

      <el-dialog title="Setting" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item label="スペース名(必須)" :label-width="formLabelWidth">
            <el-input v-model="form.spaceName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="アクセストークン（必須）" :label-width="formLabelWidth">
            <el-input v-model="form.token" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="一日の稼働時間（Hour）:初期値:8" :label-width="formLabelWidth">
            <el-input v-model="form.operatingTime" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="一人あたりの時給(万円)：初期値:0.6" :label-width="formLabelWidth">
            <el-input v-model="form.hourlySalary" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">キャンセル</el-button>
          <el-button type="primary" @click="dialogFormVisible = false; saveAccessKeys()">更新</el-button>
        </span>
      </el-dialog>
    </el-col>
  </el-row>
</template>
<style>
/* ヘッダの大枠レイアウト--------------------------------------- */
.el-col {
  background: #40cfa0;
  height: 60px;
}

.header-col {
  height: 50px;
  vertical-align: middle;
  display: table-cell;
  color: #f2f2f2;
  font-weight: bold;
  font-size: 24px;
}

.header-col__select {
  padding-top: 7px;
}

/* Selectのレイアウト -------------------------------- */
.header-col__milestone .el-select {
  width: 100%;
}

.header-col-icon {
  height: 100%;
  margin-left: 10px;
}

.el-input__inner,
.el-select-dropdown__item {
  font-size: 20px;
}

.el-icon-more {
  color: #f2f2f2;
  font-size: 24px;
  margin-top: 15px;
  cursor: pointer;
}

.el-dialog__title {
  font-weight: bold;
  font-size: 40px;
}

.el-dialog__header {
  border-bottom: #3b8070 5px solid;
}

.el-form-item__label {
  font-weight: bold;
  font-size: 16px;
}
</style>
<script>
export default {
  async mounted() {
    this.$data.form["spaceName"] = localStorage.spaceName;
    this.$data.form["token"] = localStorage.token;
    this.$data.form["operatingTime"] = localStorage.operatingTime?localStorage.operatingTime:8;
    this.$data.form["hourlySalary"] = localStorage.hourlySalary?localStorage.hourlySalary:0.6;

    this.readProjectNames();
  },
  methods: {
    /**
     * ダイアログに入力された
     * アクセストークンやスペースIDをLocalstorageに保存する
     */
    saveAccessKeys: function() {
      localStorage.spaceName = this.$data.form["spaceName"];
      localStorage.token = this.$data.form["token"];
      localStorage.operatingTime = this.$data.form["operatingTime"]?this.$data.form["operatingTime"]:8;
      localStorage.hourlySalary = this.$data.form["hourlySalary"]?this.$data.form["hourlySalary"]:0.6;

      this.readProjectNames();
    },

    /**
     * プロジェクト名を取得してセレクトに反映する
     */
    readProjectNames: function() {
      this.changeSelectForm(
        `/api/v2/projects`,
        "projectOption",
        "プロジェクト",
        false
      );
    },
    /**
     * プロジェクトが変更された時にマイルストーンに表示する内容を更新する。
     * @param event
     */
    readMilestone: function(event) {
      this.changeSelectForm(
        `/api/v2/projects/${this.$data.projectId}/versions`,
        "milestoneOption",
        "マイルストーン",
        true
      );
      this.$data.milestoneId = "";
      this.$data.chartId = "";
      this.chartCanUse = true;
      this.$router.push("/");
    },
    /**
     * セレクトボックスの情報を取得、更新する。
     * @param uri APIのURI
     * @param target 更新するセレクトボックスのData名
     * @param targetName エラーメッセージ等に出す名称
     * @param isMileStone マイルストーンの設定があるかどうか
     * @returns {Promise<void>}
     */
    changeSelectForm: async function(uri, target, targetName, isMileStone) {
      if (!localStorage.spaceName && !localStorage.token) {
        this.$message({
          message:
            "データの取得をするので、スペース名とアクセストークンを設定してください。",
          type: "warning"
        });
        return;
      }

      let url =
        `https://${localStorage.spaceName}.backlog.jp` +
        uri +
        `?apiKey=${localStorage.token}&archived=false`;

      await this.$axios
        .$get(url)
        .then(res => {
          let items = [];
          for (let item of res) {
            if (isMileStone) {
              let startDate = item.startDate
                ? item.startDate.slice(0, 10).replace(/-/g, "/")
                : "未指定";
              let releaseDueDate = item.releaseDueDate
                ? item.releaseDueDate.slice(0, 10).replace(/-/g, "/")
                : "未指定";

              items.push({
                value: item.id,
                label: item.name + ` (${startDate} ～ ${releaseDueDate})`
              });
            } else {
              items.push({ value: item.id, label: item.name });
            }
          }
          this.$data[target] = items;
        })
        .catch(e => {
          this.$message({
            message: targetName + "の一覧を取得できませんでした",
            type: "warning"
          });
          console.log(e);
        });
    },
    /**
     * マイルストーンの課題の数を取得する。
     * 課題APIでは最大100件までしか取得できないため
     * @returns {Promise<void>}
     */
    getIssueCount: async function() {
      this.$router.push("/");
      this.$data.chartId = "";
      this.chartCanUse = true;
      let url =
        `https://${localStorage.spaceName}.backlog.jp` +
        "/api/v2/issues/count" +
        `?apiKey=${localStorage.token}&projectId[]=${
          this.$data.projectId
        }&milestoneId[]=${this.$data.milestoneId}`;

      await this.$axios
        .$get(url)
        .then(res => {
          this.$data.issueCount = res.count;
        })
        .catch(e => {
          this.$message({
            message: "課題の数を取得できませんでした",
            type: "warning"
          });
          console.log(e);
        });
      this.chartCanUse = false;
    },
    /**
     * 選択されているセレクトボックスの名前を取得する
     * @param selectedId 選択されているID
     * @param optionList セレクトのリスト
     * @returns {string} 選択された文字
     */
    getSelectedName: function(selectedId, optionList) {
      let selectedItem = optionList.filter(option => {
        return option.value === selectedId;
      });

      return selectedItem[0].label;
    },
    /**
     * ストアに保存して、選択されたチャートにルーティングする
     */
    saveChartId: function() {
      this.$store.commit("projectId", this.$data.projectId);
      this.$store.commit(
        "projectName",
        this.getSelectedName(this.$data.projectId, this.$data.projectOption)
      );

      this.$store.commit("milestoneId", this.$data.milestoneId);
      this.$store.commit(
        "milestoneName",
        this.getSelectedName(this.$data.milestoneId, this.$data.milestoneOption)
      );

      this.$store.commit("chartId", this.$data.chartId);
      this.$store.commit(
        "chartName",
        this.getSelectedName(this.$data.chartId, this.$data.chartOption)
      );

      this.$store.commit("issueCount", this.$data.issueCount);

      this.$router.push(this.$data.chartId);
    }
  },
  data() {
    return {
      chartCanUse:true,
      projectOption: [],
      projectId: "",
      milestoneOption: [],
      milestoneId: "",
      chartOption: [
        {
          value: "progress_chart",
          label: "進捗表"
        },
        {
          value: "finish_ticket_chart",
          label: "チケット消化状況"
        }
      ],
      chartId: "",
      dialogFormVisible: false,
      form: {
        spaceName: "",
        token: "",
        operatingTime: "",
        hourlySalary: ""
      },
      formLabelWidth: "200px",
      issueCount: 0
    };
  }
};
</script>
