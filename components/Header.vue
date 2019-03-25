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
    <el-col :span="5">
      <div class=" header-col header-col__select">
        <el-select v-model="projectId" @change="changeProject" placeholder="プロジェクトを選択してください">
          <el-option
            v-for="item in projectOption"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
    </el-col>
    <el-col :span="5">
      <div class=" header-col header-col__select">
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
    <i class="el-icon-more"></i>
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

  .header-col-icon {
    height: 100%;
    margin-left: 10px;
  }

  /* selectのレイアウト--------------------------------- */
  .el-select {
    width: 150%;
  }

  .el-input__inner, .el-select-dropdown__item {
    font-size: 20px;
  }
  .el-icon-more{
    color:#f2f2f2;
    font-size:24px;
    margin-top: 15px;
  }


</style>
<script>
  export default {
    async mounted() {
      /* プロジェクトを取得する */
      let url = "https://sig-c.backlog.jp/api/v2/projects?apiKey=J1tGYzMxmnxtfGLwx2ixs7eB0nJxoA4zcT06ne7VYC16DRMJIEhjofB8IIbGWqkg&archived=false";
      await this.$axios.$get(url)
        .then((res) => {
          var items = [];
          for (var item of res) {
            console.log(item);
            items.push({value: item.id, label: item.name});
          }
          this.$data.projectOption = items;
        })
        .catch((e => {
          console.log('can not get project name');
          console.log(e);
        }))
    },
    methods: {
      /**
       * プロジェクトが変更された時にマイルストーンに表示する内容を更新する。
       * @param event
       */
      changeProject: async function (event) {
        /* プロジェクトを取得する */
        let url = `https://sig-c.backlog.jp/api/v2/projects/${this.$data.projectId}/versions?apiKey=J1tGYzMxmnxtfGLwx2ixs7eB0nJxoA4zcT06ne7VYC16DRMJIEhjofB8IIbGWqkg&archived=false`;

        await this.$axios.$get(url)
          .then((res) => {
            var items = [];
            for (var item of res) {
              console.log(item);
              items.push({value: item.id, label: item.name});
            }
            this.$data.milestoneOption = items;
          })
          .catch((e => {
            console.log('can not get project name');
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
        chartId: ''
      }
    }
  }
</script>
