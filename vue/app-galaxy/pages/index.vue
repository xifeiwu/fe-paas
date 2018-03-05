<template>
  <el-container id="index">
    <el-row class="el-header" height="45px" type="flex" justify="center" align="middle">
      <el-col :span=12 class="first-col">
        <div class="img">picture</div>
      </el-col>
      <el-col :span="12" class="second-col">
        <el-menu class="header-menu"
                 mode="horizontal"
                 menuTrigger="click"
                 @select="handleHeaderMenuClick"
                 defaultActive="profile"
        >
          <el-menu-item index="index">首页</el-menu-item>
          <el-submenu index="user">
            <template slot="title">产品</template>
            <el-menu-item index="app">应用引擎</el-menu-item>
            <el-menu-item index="object-storage">对象存储</el-menu-item>
          </el-submenu>
          <el-menu-item index="help">帮助文档</el-menu-item>
          <el-menu-item index="profile">控制台</el-menu-item>
        </el-menu>
        <div class="login">登录</div>
      </el-col>
    </el-row>
    <el-main>
      <section class="poster">
        <img src="/assets/imgs/galaxy/index/poster.png">
      </section>
      <section class="intro">
        <div class="title">产品介绍</div>
        <el-row class="docker" type="flex" justify="space-between" align="middle">
          <img src="/assets/imgs/galaxy/index/docker.png">
          <div class="intro">
            <div class="summary">{{dockerIntro.title}}</div>
            <ul>
              <li v-for="(item, key) in dockerIntro.list">{{item}}</li>
            </ul>
          </div>
        </el-row>
        <el-row class="storage" type="flex" justify="space-between" align="middle">
          <div class="intro">
            <div class="summary">{{storageIntro.title}}</div>
            <ul>
              <li v-for="(item, key) in storageIntro.list">{{item}}</li>
            </ul>
          </div>
          <img src="/assets/imgs/galaxy/index/storage.png">
        </el-row>
        <el-row class="communication" type="flex" justify="space-between" align="middle">
          <img src="/assets/imgs/galaxy/index/communication.png">
          <div class="intro">
            <div class="summary">{{communicationIntro.title}}</div>
            <ul>
              <li v-for="(item, key) in communicationIntro.list">{{item}}</li>
            </ul>
          </div>
        </el-row>
      </section>
      <section>
        <div class="title">产品特色</div>
      </section>
    </el-main>
    <el-footer>Footer</el-footer>
  </el-container>
</template>

<style lang="scss">
$header-height: 60px;
$header-background-color: #e7e7e7;
$aside-width: 180px;
$menu-font-size: 16px;
$menu-height: 45px;
#index.el-container {
  height: 100%;
  .el-row.el-header {
    background-color: white;
    color: #333;
    .el-col {
      &.first-col {
        line-height: $header-height;
      }
      &.second-col {
        text-align: right;
        .el-menu.header-menu {
          display: inline-block;
          background-color: transparent;
          border-width: 0px;
          .el-menu-item {
            font-size: $menu-font-size;
            line-height: $menu-height;
            height: $menu-height;
            &.is-active {
              color: black;
            }
          }
          .el-submenu {
            height: $menu-height;
            .el-submenu__title {
              font-size: $menu-font-size;
              line-height: $menu-height;
              /*height: 100%;*/
            }
            .el-menu {
              top: $menu-height + 5;
              .el-menu-item {
                text-align: left;
              }
            }
          }
        }
        .login {
          margin-left: 15px;
          display: inline-block;
          font-size: $menu-font-size;
          line-height: $menu-height;
        }
      }
    }
  }
  .el-main {
    padding: 0px;
    section.poster {
      img {
        width: 100%;
      }
      /*background-image: url(/assets/imgs/galaxy/index/poster.png);*/
      /*background-position: center;*/
      /*background-repeat: no-repeat;*/
      /*background-size: cover;*/
    }
    section.intro {
      width: 80%;
      max-width: 850px;
      margin: 5px auto;
      .title {
        display: inline-block;
        margin-bottom: 10px;
        font-size: 16px;
        color: #4A4A4A;
        border-bottom: 1px solid #4E8CEE;
      }
      .el-row {
        margin: 10px 0px;
        img {
          width: 360px;
        }
        .intro {
          max-width: 450px;
          .summary {
            font-size: 18px;
            color: #4A4A4A;
            margin-bottom: 8px;
            font-weight: bold;
          }
          ul {
            list-style: disc;
            margin-left: 20px;
          }
        }
      }
    }
  }
}
  /*.el-header {*/
    /*padding: 0px;*/
    /*.img {*/
      /*float: left*/
    /*}*/
    /*.el-menu {*/
      /*float: right;*/
    /*}*/
  /*}*/
</style>

<script>
  module.exports = {
    data() {
      return {
        dockerIntro: {
          title: '基于容器技术快速构建云原生应用开发及运行平台',
          list: [
            '支持Java，PHP、Node.JS语言，提供应用开发所需全部服务的高效开发和运营托管平台；',
            '支持CI、CD，加速应用迭代；',
            '弹性扩展，负载均衡智能应对大数据处理请求；',
            '无需运维管理与架构设计；',
            '沙箱技术隔离应用；',
            '多重安全防护机制；',
          ]
        },
        storageIntro: {
          title: '为应用提供海量、安全、稳定的存储服务',
          list: [
            '支持各种结构的的数据存储；',
            '支持标准的Restful API接口；',
            '访问速度快、易扩展；',
            '强大的数据处理和管理能力；',
            '自如应对每日千万级用户的访问；',
            '按需所用，弹性扩展；'
          ]
        },
        communicationIntro: {
          title: '为应用提供优质的通信服务能力',
          list: [
            '支持短信验证码、短信通知等场景；',
            '支持大容量、高并发通知；',
            '三网合一的专属的短信通道；',
            '电信级运维保障；',
            '实时监控发送状态和数据；',
            '服务便捷、高效、稳定',
          ]
        }
      }
    },
    methods: {
      handleHeaderMenuClick(key, keyPath) {
        keyPath = keyPath.join('/');
      }
    }
  }

</script>