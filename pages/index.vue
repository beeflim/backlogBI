<template>
  <section class="container">
    <div>
      <h1 class="title">
        backlog bi
      </h1>
      <h2 class="subtitle">
        Ticket => chart
      </h2>
    </div>
    <el-row class="top-discription">
      <el-col :span="1"></el-col>
      <el-col :span="11">
        <h3>チャートの説明</h3>
        <el-collapse v-model="ticketDiscription" accordion>
          <el-collapse-item title="チケットの作成" name="1">
            <div>
              マイルストーン、開始日時、終了日時、予定工数、完了工数、担当者を入力するようにしてください。<br>
              正しくデータが表示されないことがあります。
            </div>
          </el-collapse-item>
          <el-collapse-item title="進捗表（全体）" name="2">
            <div>
              予定と完了のバーンアップチャートを表示します。<br>
              これまでの実績をもとに将来の完了予定のグラフも表示します。<br>
              <br>
              緑の領域に予定のグラフが入っていると余裕があり、赤い領域に予定のグラフが入っていると何らかの対処が必要という目安になります。<br>
              ＊ 計算をもとに出しているわけではないので、この機能は目安程度に捉えてください。
            </div>
          </el-collapse-item>
          <el-collapse-item title="進捗表（個別）" name="3">
            <div>
              進捗表（全体）を担当者ごとに表示します。<br>
              今後の余裕な状況、深刻な状況が個々にわかるので、問題のヒアリングやチケットの分散などに役立ちます。
            </div>
          </el-collapse-item>
          <el-collapse-item title="チケット消化状況" name="4">
            <div>
              担当者ごとに、現在のチケットの消化状況がわかります。<br>
              将来のチケットの消化状況も表示されるので、隠れ前倒し状態になっているかも把握できます。
            </div>
          </el-collapse-item>
          <el-collapse-item title="複合評価（個別）" name="5">
            <div>
              現在のチケットの消化状況、残業時間の状況、今後の予測が１つのチャートに表示されます。<br>
              簡易的に分析した内容が表示されるので、誰にどのような対処が必要なのかがわかります。
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-col>
      <el-col :span="11">
        <h3>アプリの使い方について</h3>
        <el-collapse v-model="appliDiscription" accordion>
          <el-collapse-item title="必要な設定" name="1">
            <div>
              左上にある ・・・　をクリックして、スペースIDとアクセストークンの設定が必須となります。<br>
              スペースIDは、バックログURLの https://[スペースID].backlog.jp/ になります。<br>
              アクセストークンは<a href="https://backlog.com/ja/help/usersguide/personal-settings/userguide2378/">APIキーの取得</a>を参考に取得してください。<br>
              <br>
              トークンを取得したユーザーが参加しているプロジェクトしか見ることができないので、すべてのプロジェクトに参加しているユーザーを使用すると良いです。
            </div>
          </el-collapse-item>
          <el-collapse-item title="チャートの分析について（大事）" name="2" class="attention">
            <div>
              個別で表示するチャートは、個人の能力や勤務状況を批判するために使用するのではなく、<br><br>
              <span class="attention">「チームとして誰に余力があり、誰が逼迫しているのかを把握しチームとしてどのような対処を取るのが最適なのか」</span><br><br>
              を考えるために使用します。<br>
              全体最適化を目指し、早急なタスク管理、スケジュール管理を目指してください。<br><br>
              <span class="attention">個人攻撃にならないように注意してください．</span>
              <br><br>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-col>
      <el-col :span="1"></el-col>
    </el-row>
  </section>
</template>
<script>
  export default {
    data() {
      return {
        ticketDiscription: '0',
        appliDiscription: '0',
      };
    }
  }
</script>
<style>
  .container {
    min-height: 90vh;

    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .title {
    font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
    display: block;
    font-weight: 300;
    font-size: 100px;
    color: #35495e;
    letter-spacing: 1px;
  }

  .subtitle {
    font-weight: 300;
    font-size: 42px;
    color: #526488;
    word-spacing: 5px;
    padding-bottom: 15px;
  }
  .top-discription{
    margin-top: 50px;
  }
  .top-discription .el-col {
    background-color: transparent;
  }

  .el-collapse:last-of-type {
    padding-left: 5px;
    border-left: 1px solid #ddd;
  }

  .el-collapse-item__header {
    font-weight: bold;
    margin-left: 5px;
    font-size: 18px;
  }

  .el-collapse-item__wrap {
    background-color: #eee;
    border-radius: 3px;
  }

  .el-collapse-item__content {
    text-align: left;
    margin: 5px;
    font-size: 14px;
  }

  .el-collapse-item:hover {
    background-color: #00DAA1;
    border-radius: 3px;
    transition-property: background-color;
    transition-delay: .3s;
    transition-duration: .3s;
  }

  .el-collapse-item {
    background-color: transparent;
    border-radius: 3px;
    transition-property: background-color;
    transition-delay: .3s;
    transition-duration: .3s;
  }


  .attention,.attention .el-collapse-item__header{
    font-weight: bold;
    color: orangered;
  }
</style>

