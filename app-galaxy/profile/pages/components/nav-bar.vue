<template>
  <div :class="{'nav-bar': true, collapse: collapseMenu}" :style="{width: $storeHelper.navMenuWidth+'px'}">
    <div :class="{'img': true,  collapse: collapseMenu}">
      <a :href="$net.page['index']">
        <img v-if="collapseMenu"  @click="handleAsideMenuSelect('index', ['index'])" src="data:image/png;base64,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AVACgCgAiPUB1MlJ8f0z8tKdHCe8aFIA/Ce5/J0+ALED4JtULh/fKZd/2wuA3QPoyp2YywEACCoATURR4Ym8/g67FfAv8Q+9ewl0gkc76QAAAAlwSFlzAAALEwAACxMBAJqcGAAACelpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQwIDc5LjE2MDQ1MSwgMjAxNy8wNS8wNi0wMTowODoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTgtMDMtMDZUMTc6MDA6NDMrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMDMtMDZUMTc6MzM6MzUrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE4LTAzLTA2VDE3OjMzOjM1KzA4OjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmMyNGQ3ZjdmLTA1OTctNGU5MS1hN2NjLTdkY2QzMTU3MjhmNSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjAwOTY1MmNmLTIwOWItMzI0Zi05ZDBlLWFiZjIzNzFkMmVkOSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmMwZjE3YzNjLWZlOTItNGM5Mi05MGVmLTAyNmZjOTEwYzc3YiIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJEaXNwbGF5Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjMGYxN2MzYy1mZTkyLTRjOTItOTBlZi0wMjZmYzkxMGM3N2IiIHN0RXZ0OndoZW49IjIwMTgtMDMtMDZUMTc6MDA6NDMrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YzA5ZGRlOGUtM2YyMy00YTg4LWE5MzctNTllMTM2YTYyMDRhIiBzdEV2dDp3aGVuPSIyMDE4LTAzLTA2VDE3OjMzOjM1KzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmMyNGQ3ZjdmLTA1OTctNGU5MS1hN2NjLTdkY2QzMTU3MjhmNSIgc3RFdnQ6d2hlbj0iMjAxOC0wMy0wNlQxNzozMzozNSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06SW5ncmVkaWVudHM+IDxyZGY6QmFnPiA8cmRmOmxpIHN0UmVmOmxpbmtGb3JtPSJSZWZlcmVuY2VTdHJlYW0iIHN0UmVmOmZpbGVQYXRoPSJjbG91ZC1hc3NldDovL2NjLWFwaS1zdG9yYWdlLmFkb2JlLmlvL2Fzc2V0cy9hZG9iZS1saWJyYXJpZXMvNzc0OWIzOTctMzU4MS00ZjVjLWFlZjgtYWVhNGMwZjM0YzcwO25vZGU9NzdiMDE1NzctOTgyMi00MzA2LWJjZDctNTFmNTMxMjU4Mjg2IiBzdFJlZjpEb2N1bWVudElEPSJ1dWlkOjE5ZDM1MGI5LTc4NTYtZjk0NC05ZTE1LTk5OGVkMTdlZTc2ZSIvPiA8L3JkZjpCYWc+IDwveG1wTU06SW5ncmVkaWVudHM+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmMwOWRkZThlLTNmMjMtNGE4OC1hOTM3LTU5ZTEzNmE2MjA0YSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpjMGYxN2MzYy1mZTkyLTRjOTItOTBlZi0wMjZmYzkxMGM3N2IiIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjMGYxN2MzYy1mZTkyLTRjOTItOTBlZi0wMjZmYzkxMGM3N2IiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7xOyDBAAAEOklEQVRYhe2Xa2gcVRTHfztpdCuDbenTWlmtpaDIjrXSNsHY1lBnkfQ2ffgoNlTQfIhuSKniA0WsVqFQ1OIIPlolXVEUo+221UzABgnUtIo646NqHzFEYgohRZzaNXGNH+Zu9zq7m9kiEj94YOHe/znn/v/3njv33o2Mjo4ynqaNK/t/QUDkfBM8x5wLtAC3ADEJ9wIfADt0wz75rwjwHDMCPAo8DlSWCBsBngSe1g27rM01oVwBwA6gOSSmEngKmAZsKmfQsvaA55gtAfKPgBuBC4ELgKVAp+Jv8RxzdTljh5bAc8w6YK8i9iXg3uASyxK9DDRK6Khu2Ff/IwGeY14LdAG6hPYBq3XDzpaIrwQc4CoJTdcNe3AsjpIl8BzzEkmYI/8CWF+KHEA37BH8FcrZjLHISwrwHPMiYD8wR0L9wErdsM+EDQgcUdoTz1uA55ga8AZwnQJ/CwjPMecE44vYH0q7Iiy4YA94jrkNeLBEfBbYDdyvG/bpYgGeY94MLMlkJ+w1W+85O5KtmAicci0xECrAc8xG4JUw1cAJYIVu2D1BRzyZnisncAcwSXH9CLwOPOda4tcCAZ5j1gIfkj/lzgBvAi5+LVfIX86+Aa7XDTujkDfgf4pj1b4HqHct4QYFfAVcI7ufAvW6YfermZ5jmsA7wMUSekI37C2S/E78vaPaAHAKuELJATgNLHYtcSySSGUiwPYHYttal0w69B4wDFTphv1LMfmeY64E0rI7BMyufvW+BfgnYVTinwPNriUOSXEVwK2ABUyVMZ8BiyOJVKYeeB840nzZ83ctndKZKVbbgIhOYBnw/eb2ujXdfbGDwEzp7gZqXUv8FsyLJ9Pz8D/TKRJaqwEbZGfRC32bFoaRSzsADDk/z7q9uy/2lkKeBTYWIwdwLXEceEyBNmhAlez8DrSVQQ7QM5zV1jXtX7sViCt4l2uJH0Jyd+OXGaBaA2bLzrH2hujZcth1w25b9lpTHVAXcH0dlutawsP/EgBmaviPCPCv1rIsnkw3ApuLuEJPPmnnHjQa8JNsX5lIZaYWj/8b+XLgRQXao7QXlZE/A7hcdns14KAipiUkeT7+PsnNoANYR34SC+PJdHWIhibyd9DHGrBTcT6cSGVqi2UlUpkoMJ/89fwdcJtriSyQUkJT8WT60hITuAl4RIF2ReTge4BVEhwBtgM72xuiJxOpzGRgDbAVeLb/cIcD7AKWu5Y4IQeeDBwFZskxBvAfr22uJYbiyXQMuBt4CP8JB7DPtYTICZgGfALMC4j+k8Ire0v/4Y5nXEsMq2A8ma4BbArvgSyFm/M4UOVaYlADaG+IDgI15PdDzoLkvcCBIDmAa4kuoBboC7iC5J1AjWuJQSjyHkikMquAjcANwHT8W/FL4G38sox5VsSTaR1/udcDC/CXfAh/hVuBd11LnHvQRv7/czreAv4C9TdT5ORi9tcAAAAASUVORK5CYII=">
        <img v-else style="padding-right: 18px;"@click="handleAsideMenuSelect('index', ['index'])" src="/assets/imgs/finup-cloud-2.png">
      </a>
    </div>
    <el-menu
            mode="vertical"
            :collapseTransition="false"
            @select="handleAsideMenuSelect"
            :collapse="collapseMenu"
            background-color="#324157"
            text-color="white"
            active-text-color="#409EFF"
            :setActiveIndexByDefaultActive="true"
            :defaultActive="activeSideMenuItem">
      <div v-for="(item, index) in menuList" :key="index">
        <el-submenu :index="item.router" v-if="item.children">
          <template slot="title">
            <i v-if="item.icon" :class="item.icon"></i><span>{{item.name}}</span>
          </template>
          <el-menu-item v-for="subMenu in item.children" :key="subMenu.name" :index="subMenu.router">
            <i v-if="subMenu.icon" :class="subMenu.icon"></i><a :href="subMenu.router" @click="evt => evt.preventDefault()" style="color: inherit">{{subMenu.name}}</a>
            <span class="beta" v-if="subMenu.beta">beta</span>
          </el-menu-item>
        </el-submenu>
        <el-menu-item :index="item.router" v-else>
          <i :class="item.icon"></i><a slot="title" :href="item.router" @click="evt => evt.preventDefault()" style="color: inherit">{{item.name}}</a>
          <span :class="['beta', collapseMenu?'hide':'']" v-if="item.beta">beta</span>
        </el-menu-item>
      </div>
    </el-menu>
    <div :class="{'toggle': true, collapse: collapseMenu}">
      <i :class="{'paas-icon-double-arrow-right': true, collapse: collapseMenu}" @click="toggleMenu"></i>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  $header-height: 45px;
  $header-background-color: #3976EF;
  $header-background-color: #e7e7e7;
  $split-line-color: #e7e7e7;
  $aside-width: 200px;

  $main-background: #F2F6FC;
  .nav-bar {
    position: relative;
    transition: width 0.3s ease-out;
    /*&.collapse {*/
      /*width: 56px;*/
    /*}*/
    box-sizing: border-box;
    width: $aside-width;
    height: 100%;
    background: #324157;

    .img {
      line-height: $header-height;
      text-align: center;
      img {
        width: 120px;
        cursor: pointer;
        vertical-align: middle;
      }
      &.collapse {
        img {
          width: 30px;
        }
      }
    }

    .el-menu {
      margin-top: 5px;
      width: 100%;
      // override default style of border-right
      border-right: 0px;
      .el-menu-item {
        position: relative;
        .beta {
          position: absolute;
          top: 13px;
          right: 5px;
          display: inline;
          /*color: #E6A23C;*/
          /*color: #F56C6C;*/
          color: #EF9C69;
          border: 1px solid #EF9C69;
          font-size: 12px;
          line-height: 12px;
          cursor: pointer;
          padding: 1px;
          border-radius: 4px;
          word-break: normal;
          &.hide {
            display: none;
          }
        }
        &:hover {
          .beta {
            color: #F56C6C;
            border: 1px solid #F56C6C;
          }
        }
      }
      &.el-menu--collapse {
        .el-submenu {
          .el-menu {
            .el-menu-item {
              min-width: 165px;
              padding-left: 8px !important;
            }
          }
        }
      }
    }
    .toggle {
      position: absolute;
      bottom: 18px;
      width: 100%;
      box-sizing: border-box;
      padding: 0px 15px;
      font-size: 18px;
      color: white;
      text-align: right;
      i {
        transform: rotate(180deg);
        &:hover {
          cursor: pointer;
        }
      }
      &.collapse {
        text-align: center;
        i {
          transform: rotate(0deg);
        }
      }
    }
  }
</style>

<script>
  import {mapGetters} from 'vuex';
  export default {
    created() {
      // NOTICE: if data format is not correct, re-login. 过渡代码
      if (!Array.isArray(this.profileMenus)) {
        this.$storeHelper.logout();
        const targetHref = this.$net.getCasLogoutHref();
        window.location.href = targetHref;
      }
    },
    mounted() {
    },
    computed: {
      ...mapGetters({
        'collapseMenu': 'collapseMenu'
      }),
      profileMenus() {
        return this.$storeHelper.menus['profile'];
      },
      menuList() {
        const MENU_ALL = [{
          name: '概况',
          router: '/profile/general',
          icon: 'paas-icon-app',
          path: '/2.x/general',
        }, {
          name: '应用引擎',
          router: '/profile/app-engine',
          icon: 'paas-icon-app',
          path: '/custom/2.x/app_engine',
          children: [{
            name: '应用管理',
            router: '/profile/app',
            icon: 'paas-icon-app',
            path: '/2.x/app',
          }, {
            name: '服务管理',
            router: '/profile/service',
            icon: 'paas-icon-service',
            path: '/2.x/service',
          }, {
            name: '实例列表',
            router: '/profile/instance',
            icon: 'paas-icon-instance',
            path: '/2.x/instances',
          }, {
            name: '外网域名',
            router: '/profile/domain',
            icon: 'paas-icon-domain',
            path: '/2.x/internet'
          }, {
            name: '日志中心',
            router: '/profile/log',
            icon: 'paas-icon-log',
            path: '/2.x/logs'
          }, {
            name: '审批管理',
            router: '/profile/work-order',
            icon: 'paas-icon-work-order',
            path: '/2.x/orders',
          }, {
            name: '应用监控',
            router: '/profile/monitor',
            icon: 'paas-icon-charts',
            path: '/2.x/apm'
          }, {
            name: 'API网关',
            router: '/profile/gateway',
            icon: 'paas-icon-gateway',
            path: '/2.x/gateway'
          }]
        }, {
          name: '中间件与数据库',
          router: '/profile/middleware',
          icon: 'paas-icon-openshift',
          path: '/custom/2.x/openshift',
          children: [{
            name: 'Mariadb(非生产)',
            router: '/profile/middleware/mariadb',
            icon: 'paas-icon-mysql',
            path: '/2.x/openShift/mariaDB',
            beta: true
          }, {
            name: 'Redis',
            router: '/profile/middleware/redis',
            icon: 'paas-icon-redis',
            path: '/2.x/openShift/redis',
            beta: true
          }]
        }, {
          name: 'Access Key管理',
          router: '/profile/oauth',
          icon: 'paas-icon-key',
          path: '/2.x/keys',
        }, {
          name: '应用配置',
          router: '/profile/config-server',
          icon: 'paas-icon-config',
          path: '/2.x/config/server'
        }, {
          name: '镜像中心',
          router: '/profile/image/repo',
          icon: 'paas-icon-image',
          path: '/2.x/images',
        }, {
          name: 'Pipeline',
          router: '/profile/pipeline',
          icon: 'paas-icon-jenkins',
          path: '/2.x/pipeline',
          beta: true
        }];
        const pathList = this.profileMenus.map(it => it.path).concat(['/custom/2.x/app_engine', '/custom/2.x/openshift'])
        var menuList = MENU_ALL.filter(it => pathList.includes(it.path));
        menuList.forEach(it => {
          if (it.hasOwnProperty('children')) {
            it.children = it.children.filter(it2 => pathList.includes(it2.path));
          }
        });
        // remove menu with zero-length submenu
        menuList = menuList.filter(it => !(it.hasOwnProperty('children') && it.children.length === 0));
        return menuList;
      }
    },
    data() {
      return {
      }
    },
    props: {
      activeSideMenuItem: {
        type: String,
      },
    },
    watch: {
    },
    methods: {
      /**
       * menu click handler for el-menu
       * @param key, string, such as '/log'
       * @param keyPath, array, such as ["/log"]
       */
      handleAsideMenuSelect(key, keyPath) {
        if (keyPath.length > 0) {
          switch (key) {
            case '/profile/app_manager':
              this.$router.push(key);
              break;
            case 'index':
              this.$utils.goToPath(this.$net.page['index']);
              this.emit('menu-click', 'index');
            default:
              this.$router.push(key);
              break;
          }
        }
      },
      toggleMenu() {
        this.$store.dispatch('setConfig', {
          collapseMenu: !this.collapseMenu
        });
      },
    }
  }
</script>
