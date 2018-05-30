<template>
  <div id="user-info">
    <div class="container">
      <el-row class="section">
        <div class="title">凡普云产品</div>
        <div class="list el-row">
          <div class="el-col el-col-6" v-for="(item, index) in productList" :key="index" @click="handleProductClick(item)">
            <span>{{item.title}}</span>
            <img :src="item.img">
          </div>
        </div>
      </el-row>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  #user-info {
    .container {
      width: 800px;
      margin: 15px auto;
      .el-row.section {
        box-shadow: 0 0 8px 0 rgba(232, 237, 250, 0.6), 0 2px 4px 0 rgba(232, 237, 250, 0.5);
        padding: 8px;
        margin-top: 5px;
        padding: 0px;
        .title {
          background-color: #409EFF;
          color: white;
        }
        .el-row {
          margin-top: 2px;
          &.list {
            text-align: center;
            .el-col {
              position: relative;
              padding: 5px;
              height: 200px;
              box-sizing: border-box;
              border: 1px solid #909399;
              &:hover {
                border: 1px solid #409EFF;
                cursor: pointer;
              }
              img {
                position: absolute;
                bottom: 3px;
                left: 3px;
                right: 3px;
                width: 190px;
              }
            }
          }
        }
      }
    }
  }
</style>
<script>
  export default {
    created() {
    },
    mounted() {
    },
    data() {
      return {
        userRole: '未知',
        productList: [{
          title: '应用引擎',
          img: '/assets/imgs/index/docker.png',
          to: '/profile',
        }]
      }
    },
    computed: {
    },
    methods: {
      handleProductClick(item) {
        if (item.hasOwnProperty('to')) {
          this.$utils.goToPath(item.to);
        }
      }
    }
  }
</script>