<template>
  <el-row>
    <el-col :span="1" class="header-table">
      <div class=" header-col">
        <img class="header-col-icon" alt="backlogBI" src="~assets/images/backlog_icon.png"/>
      </div>
    </el-col>
    <el-col :span="3" class="header-table">
      <div class=" header-col">
        Backlog BI
      </div>
    </el-col>
    <el-col :span="4">
      <div class=" header-col header-col__select">
        <el-select v-model="projectId" @change="readMilestone" placeholder="プロジェクトを選択してください">
          <el-option
            v-for="item in projectOption"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
    </el-col>
    <el-col :span="6">
      <div class=" header-col header-col__select header-col__milestone">
        <el-select v-model="milestoneId" placeholder="マイルストーンを選択してください">
          <el-option
            v-for="item in milestoneOption"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
    </el-col>
    <el-col :span="5">
      <div class=" header-col header-col__select">
        <el-select v-model="chartId" placeholder="チャートを選択してください">
          <el-option
            v-for="item in chartOption"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
    </el-col>
    <el-col :span="4">
      <div class=" header-col">Option</div>
    </el-col>
    <el-col :span="1">
      <i @click="dialogFormVisible = true" class="el-icon-more"></i>

      <el-dialog title="Setting" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item label="スペース名" :label-width="formLabelWidth">
            <el-input v-model="form.spaceName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="アクセストークン" :label-width="formLabelWidth">
            <el-input v-model="form.token" autocomplete="off"></el-input>
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
    width:150%;
  }
  .header-col-icon {
    height: 100%;
    margin-left: 10px;
  }

  .el-input__inner, .el-select-dropdown__item {
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
    border-bottom: #3B8070 5px solid;
  }

  .el-form-item__label {
    font-weight: bold;
    font-size: 16px;
  }

</style>
<script>
  export default {
    async mounted() {
      this.readProjectNames();
    },
    methods: {
      /**
       * ダイアログに入力された
       *　アクセストークンやスペースIDをLocalstorageに保存する
       */
      saveAccessKeys: function () {
        localStorage.spaceName = this.$data.form['spaceName'];
        localStorage.token = this.$data.form['token'];
      },

      /**
       * プロジェクト名を取得してセレクトに反映する
       */
      readProjectNames: function () {
        this.changeSelectForm(`/api/v2/projects`, 'projectOption', 'プロジェクト', false);
      },
      /**
       * プロジェクトが変更された時にマイルストーンに表示する内容を更新する。
       * @param event
       */
      readMilestone: async function (event) {
        this.changeSelectForm(`/api/v2/projects/${this.$data.projectId}/versions`, 'milestoneOption', 'マイルストーン', true);
      },
      /**
       * セレクトボックスの情報を取得、更新する。
       * @param uri APIのURI
       * @param target 更新するセレクトボックスのData名
       * @param targetName エラーメッセージ等に出す名称
       * @returns {Promise<void>}
       */
      changeSelectForm: async function (uri, target, targetName, isMileStone) {
        let url = `https://${localStorage.spaceName}.backlog.jp` + uri + `?apiKey=${localStorage.token}&archived=false`;

        await this.$axios.$get(url)
          .then((res) => {
            let items = [];
            for (let item of res) {
              if (isMileStone) {

                let startDate = (item.startDate) ? item.startDate.slice(0, 10).replace(/-/g, '/') : '未指定';
                let releaseDueDate = (item.releaseDueDate) ? item.releaseDueDate.slice(0, 10).replace(/-/g, '/') : '未指定';

                items.push({value: item.id, label: item.name + ` (${startDate} ～ ${releaseDueDate})`});
              } else {
                items.push({value: item.id, label: item.name});
              }
            }
            this.$data[target] = items;
          })
          .catch((e => {
            this.$message({
              message: targetName + 'の一覧を取得できませんでした',
              type: 'warning'
            });
            console.log(e);
          }))

      }
    },
    data() {
      return {
        projectOption: [],
        projectId: '',
        milestoneOption: [],
        milestoneId: '',
        chartOption: [
          {
            value: "progress_chart",
            label: "進捗表"
          }
        ],
        chartId: '',
        dialogFormVisible: false,
        form: {
          spaceName: '',
          token: ''
        },
        formLabelWidth: '200px'
      }
    }
  }
</script>
