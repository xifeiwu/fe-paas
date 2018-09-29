<template>
  <div id="page-not-found">
    <div class="main">
      <div class="code">404 !</div>
      <div class="text">page not found</div>
      <div class="navigate">
        <div class="tip">页面导航：</div>
        <div class="list">
          <div class="item" v-for="(item, index) in navigateList" :key="item.href">
            <a :href="item.href">{{item.label}}</a><div class="ant-divider" v-if="index !== navigateList.length - 1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  #page-not-found {
    height: 100%;
    text-align: center;
    .main {
      margin-top: 20px;
      display: inline-block;
      padding: 20px 30px;
      background-color: white;
      border-radius: 10px;
      .code {
        color: #E6A23C;
        font-size: 50px;
        font-weight: bold;
      }
      .text {
        color: #606266;
        font-size: 32px;
        font-weight: bold;
      }
      .navigate {
        margin-top: 20px;
        .tip {
          font-size: 14px;
          font-weight: bold;
          line-height: 18px;
          text-align: center;
          color: #E6A23C;
        }
        .list {
          .item {
            display: inline-block;
          }
        }
      }
      .ant-divider {
        margin: 0 6px;
        display: inline-block;
        height: 12px;
        width: 1px;
        background: #ccc;
      }
    }
  }
</style>
<script>
  export default {
    mounted() {
    },
    props: {
      navigateList: {
        type: Array,
        default() {
          return [{
            href: '/index',
            label: '首页'
          }, {
            href: '/profile',
            label: '控制台'
          }, {
            href: '/docs',
            label: '帮助文档'
          }]
        }
      }
    }
  }
</script>

