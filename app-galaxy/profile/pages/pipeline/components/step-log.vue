<template>
  <div class="step-log">
    <div class="logs">
      <pre v-for="(item,index) in logs">
        <span class="line-number">{{index+1}}</span>
        <span class="line-text">{{item}}</span>
      </pre>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .step-log {
    background-color: #333333;
    border: none;
    color: #f5f5f5;
    font-size: 14px;
    .logs {
      padding: 6px;
      overflow: scroll;
      pre {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        font-size: 12px;
        height: 18px;
        .line-number {
          text-align: right;
          min-width: 40px;
          margin-left: 16px;
          color: #777777;
          white-space: nowrap;
        }
        .line-text {
          color: #f5f5f5;
          padding-left: 22px;
          padding-right: 15px;
          max-width: 100%;
        }
      }
    }
  }
</style>

<style lang="scss">

</style>

<script>
  export default {
    created() {

    },
    mounted() {

    },
    props: {
      logs: {
        type: Array,
      }
    }
  }
</script>