<template>
  <div id="user-info">
    <div class="container">
      <div class="production">
        <div class="title">金融云产品</div>
        <div class="list">
          <div class="item" v-for="(item, index) in productList" :key="index"
               @click="handleProductClick(item)"
               :style="'background-image: url(' + item.img + ')'"
          >
            <span>{{item.title}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  #user-info {
    .container {
      width: calc(100% - 30px);
      margin: 15px auto;
      .production {
        box-shadow: 0 0 8px 0 rgba(232, 237, 250, 0.6), 0 2px 4px 0 rgba(232, 237, 250, 0.5);
        margin-top: 5px;
        padding: 0px;
        .title {
          background-color: #409EFF;
          color: white;
          margin-bottom: 6px;
        }
        .list {
          text-align: left;
          padding: 6px;
          .item {
            display: inline-block;
            position: relative;
            width: 160px;
            height: 160px;
            box-sizing: border-box;
            border: 1px solid #909399;
            background-position: bottom;
            background-repeat: no-repeat;
            background-size: 100% 60%;
            text-align: center;
            &:hover {
              border: 1px solid #409EFF;
              cursor: pointer;
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