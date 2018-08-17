<template>
  <el-container id="index" direction="vertical">
    <paas-header @menu-click="handleClickOnPassHeader"></paas-header>
    <el-main>
      <section class="poster">
        <img src="/assets/imgs/index/poster.png">
        <div class="description">
          <div class="content">
            <div class="line1">为凡普业务研发</div>
            <div class="line2">提供可靠、弹性、易用的企业级云计算服务平台</div>
            <div class="line3" v-if="false">敬请期待</div>
          </div>
        </div>
      </section>
      <section class="introduce">
        <div class="title">产品介绍</div>
        <el-row class="docker" type="flex" justify="space-between" align="middle">
          <img src="/assets/imgs/index/docker.png">
          <div class="intro">
            <div class="summary">{{dockerIntro.title}}</div>
            <ul>
              <li v-for="(item, key) in dockerIntro.detail">{{item}}</li>
            </ul>
            <el-button type="primary" round size="mini" @click="handleClick('go-to-profile')">立即使用</el-button>
          </div>
        </el-row>
        <el-row class="storage" type="flex" justify="space-between" align="middle">
          <div class="intro">
            <div class="summary">{{storageIntro.title}}</div>
            <ul>
              <li v-for="(item, key) in storageIntro.detail">{{item}}</li>
            </ul>
            <el-button round disabled size="mini">敬请期待</el-button>
          </div>
          <img src="/assets/imgs/index/storage.png">
        </el-row>
        <el-row class="communication" type="flex" justify="space-between" align="middle" v-if="false">
          <img src="/assets/imgs/index/communication.png">
          <div class="intro">
            <div class="summary">{{communicationIntro.title}}</div>
            <ul>
              <li v-for="(item, key) in communicationIntro.detail">{{item}}</li>
            </ul>
            <el-button round disabled size="mini">敬请期待</el-button>
          </div>
        </el-row>
      </section>
      <section class="feature">
        <div class="title">产品特色</div>
        <el-row>
          <el-col :span="6">
            <div class="card card1">
              <div class="icon"></div>
              <div class="title">{{features[0].title}}</div>
              <div class="detail">{{features[0].detail}}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="card card2">
              <div class="icon custom"></div>
              <div class="title">{{features[1].title}}</div>
              <div class="detail">{{features[1].detail}}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="card card3">
              <div class="icon"></div>
              <div class="title">{{features[2].title}}</div>
              <div class="detail">{{features[2].detail}}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="card card4">
              <div class="icon"></div>
              <div class="title">{{features[3].title}}</div>
              <div class="detail">{{features[3].detail}}</div>
            </div>
          </el-col>
        </el-row>
      </section>
      <section class="footer">
        <div class="row">
          <div class="col">
            <div class="title">{{footer.production.title}}</div>
            <ul>
              <li v-for="item in footer.production.items"
                  :class="{'linker': item.target}"
                  @click="handleFooterClick(item)">{{item.label}}</li>
            </ul>
          </div>
          <div class="col">
            <div class="title">{{footer.helper.title}}</div>
            <ul>
              <li v-for="(item, key) in footer.helper.items"
                  :class="{'linker': item.target}"
                  @click="handleFooterClick(item)">{{item.label}} </li>
            </ul>
          </div>
          <div class="col">
            <div class="title">{{footer.about.title}}</div>
            <ul>
              <li v-for="(item, key) in footer.about.items">
                {{item.label}}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </el-main>
    <el-footer height="0px"></el-footer>
  </el-container>
</template>
<style lang="scss" scoped>
$header-height: 60px;
$header-background-color: #e7e7e7;
$aside-width: 180px;
$menu-font-size: 16px;
$menu-height: 45px;
#index.el-container {
  height: 100%;
  .el-main {
    padding: 0px;
    section.poster {
      position: relative;
      img {
        width: 100%;
      }
      .description {
        position: absolute;
        top: 0px;
        left: 0px;
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: space-around;
        align-items: center;
        .content {
          text-align: center;
          .line1 {
            margin: 0px auto;
            color: white;
            font-size: 16px;
          }
          .line2 {
            margin: 10px auto 20px auto;
            color: white;
            font-size: 28px;
            line-height: 40px;
          }
          .line3 {
            display: inline-block;
            margin: 0px auto;
            color: white;
            font-size: 12px;
            padding: 3px 6px;
            border: 1px solid white;
          }
        }
      }
    }
    section.introduce {
      width: 80%;
      max-width: 700px;
      margin: 20px auto;
      .title {
        display: inline-block;
        margin-bottom: 10px;
        font-size: 20px;
        color: #4A4A4A;
        border-bottom: 1px solid #4E8CEE;
      }
      .el-row {
        margin: 20px 0px;
        img {
          width: 240px;
        }
        .intro {
          max-width: 400px;
          .summary {
            font-size: 16px;
            color: #4A4A4A;
            margin-bottom: 8px;
            font-weight: bold;
          }
          ul {
            list-style: disc;
            margin-left: 20px;
            font-size: 14px;
          }
          .el-button {
            margin-left: 10px;
            margin-top: 10px;
          }
        }
      }
    }
    section.feature {
      width: 80%;
      max-width: 840px;
      margin: 20px auto;
      .title {
        display: inline-block;
        margin-bottom: 20px;
        font-size: 20px;
        color: #4A4A4A;
        border-bottom: 1px solid #4E8CEE;
      }
      .el-row {
        .el-col {
          padding: 0px 10px;
          .card {
            border:1px solid #eaeefb;
            padding: 20px 10px;
            border-radius:5px;
            box-sizing: border-box;
            text-align: center;
            position: relative;
            bottom: 0;
            transition: all .3s ease-in-out;
            &:hover {
              bottom: 6px;
              box-shadow: 0 6px 18px 0 rgba(232,237,250,0.50);
            }
            .title {
              display: block;
              margin: 10px 0px;
              font-size: 16px;
              text-decoration: none;
              border-width: 0px;
              text-align: center;
            }
            .detail {
              color: #9B9B9B;
              font-size: 12px;
              text-align: center;
            }
            .icon {
              width: 80px;
              height: 80px;
              margin: 0px auto;
              background-image: url(/assets/imgs/index/feature-icons.png);
              background-repeat: no-repeat;
              background-size: cover;
            }
            &.card1 {
              .icon {
                background-position: 0px 0px;
              }
            }
            &.card2 {
              .icon {
                background-position: -80px 0px;
              }

            }
            &.card3 {
              .icon {
                width: 83px;
                background-position: -159px 0px;
              }
            }
            &.card4 {
              .icon {
                background-position: -242px 0px;
              }
            }
          }
        }
      }
    }
    section.footer {
      background-color: #3E3E3E;
      height: 200px;
      padding-top: 40px;
      .row {
        width: 400px;
        display: flex;
        margin: 0px auto;
        justify-content: space-between;
        align-items: flex-start;
        .col {
          display: inline-block;
          text-align: center;
          .title {
            font-size: 14px;
            line-height: 36px;
            color: white;
          }
          ul li {
            &.linker {
              cursor: pointer;
              &:hover {
                color: white;
              }
            }
            font-size: 12px;
            line-height: 20px;
            color: #818181;
          }
        }
      }
    }
  }
}
</style>

<script>
  import paasHeader from '../components/header';
  module.exports = {
    components: {paasHeader},
    data() {
      return {
        dockerIntro: {
          title: '基于容器技术快速构建云原生应用开发及运行平台',
          detail: [
            '支持Java，Node.JS语言，提供应用开发所需全部服务的高效开发和运营托管平台；',
            '支持CI、CD，加速应用迭代；',
            '弹性扩展，负载均衡智能应对大数据处理请求；',
            '无需运维管理与架构设计；',
            '沙箱技术隔离应用；',
            '多重安全防护机制；',
          ]
        },
        storageIntro: {
          title: '为应用提供海量、安全、稳定的存储服务',
          detail: [
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
          detail: [
            '支持短信验证码、短信通知等场景；',
            '支持大容量、高并发通知；',
            '三网合一的专属的短信通道；',
            '电信级运维保障；',
            '实时监控发送状态和数据；',
            '服务便捷、高效、稳定',
          ]
        },
        features: [{
          title: '简单易用',
          detail: '一键创建应用，自动部署， 持续集成、交付的 一站式应用运营和管理'
        }, {
          title: '安全可靠',
          detail: '成熟可靠的技术架构，多重防护机制，多地互备，7*24小时全方位监控'
        }, {
          title: '丰富兼容',
          detail: '镜像类型丰富，支持应用无缝迁移，持续为应用提供完整的计算、存储服务'
        }, {
          title: '按需所用',
          detail: '按应用所需效率灵活自动扩展资源，保障业务的高可靠性、可用性'
        }],
        footer: {
          production: {
            title: '产品',
            items: [{
              label: '应用引擎',
              target: '/profile'
            }, {
              label: '对象存储',
            }, {
              label: '通信服务'
            }]
          },
          helper: {
            title: '帮助文档',
            items: [{
              label: '快速入门',
              target: '/docs#快速入门'
            }, {
              label: '常见问题',
              target: '/docs#常见问题'
            }, {
              label: '版本更新'
            }]
          },
          about: {
            title: '关于凡普云',
            items: [{
              label: '平台架构'
            }, {
              label: '用户协议'
            }]
          }
        }
      }
    },
    methods: {
      handleClickOnPassHeader(keyPath) {
        switch (keyPath) {
          case 'profile':
          case 'product/app':
          case 'login':
            this.$utils.goToPath('/profile');
            break;
          case 'docs':
            this.$utils.goToPath('/docs');
            break;
          case 'index':
            this.$utils.goToPath('/index');
            break;
        }
      },
      handleClick(action) {
        switch (action) {
          case 'go-to-profile':
            this.$utils.goToPath('/profile');
            break;
        }
      },
      handleFooterClick(item) {
        console.log(item);
        if (item && item.hasOwnProperty('target')) {
          this.$utils.goToPath(item.target);
        }
      }
    }
  }

</script>