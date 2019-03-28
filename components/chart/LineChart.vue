<script>
  import { Line } from 'vue-chartjs'
  export default {
    name: 'LineChart',
    extends: Line,
    props: ['data', 'options'],
    mounted: function(){
      console.log(this.data);
      console.log(this.option);
      this.renderChart(this.data, this.options)
    },
    watch : {
      data : function(val) {
        this.renderChart(this.data, this.options)
      },
      options : function(val) {
        this.renderChart(this.data, this.options)
      }
    }
  }
</script>
