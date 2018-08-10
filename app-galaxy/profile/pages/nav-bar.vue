<template>
  <div :class="{'nav-bar': true, collapse: collapseMenu}">
    <div class="img" @click="handleAsideMenuSelect('index', ['index'])">
      <img src="/assets/imgs/finup-cloud-2.png">
    </div>
    <el-menu
            class="el-menu-vertical-demo"
            :collapseTransition="false"
            @select="handleAsideMenuSelect"
            :collapse="collapseMenu"
            background-color="#324157" text-color="white"
            :defaultActive="activeSideMenuItem">
      <el-submenu v-for="menu in navMenu.level2" :key="menu.name" :index="menu.router">
        <template slot="title">
          <i v-if="menu.icon" :class="menu.icon"></i><span>{{menu.name}}</span>
        </template>
        <el-menu-item v-for="subMenu in menu.children" :key="subMenu.name" :index="subMenu.router">
          <i v-if="subMenu.icon" :class="subMenu.icon"></i><span>{{subMenu.name}}</span>
        </el-menu-item>
      </el-submenu>
      <el-menu-item v-for="menu in navMenu.level1" :key="menu.name" :index="menu.router">
        <i :class="menu.icon"></i><span>{{menu.name}}</span>
      </el-menu-item>
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
  /*$main-background: #E4E7ED;*/

  $menu-background: white;
  $menu-background-hover: #ecf5ff;
  $menu-background-active: #409EFF;
  $menu-font-color: #2d2f33;
  $menu-font-color-hover: #2d2f33;
  $menu-font-color-active: white;

  $menu-background: rgb(0, 21, 41);
  $menu-background-hover: rgb(0, 21, 41);
  $menu-background-active: $main-background;
  $menu-font-color: rgba(255, 255, 255, 0.7);
  $menu-font-color-hover: white;
  $menu-font-color-active: black;
  .nav-bar {
    position: relative;
    &.collapse {
      width: 64px;
    }
    box-sizing: border-box;
    width: $aside-width;
    height: 100%;
    float: left;
    background: #324157;

    .img {
      line-height: $header-height;
      cursor: pointer;
      img {
        width: 120px;
        margin-left: 12px;
        vertical-align: middle;
      }
    }

    .el-menu {
      margin-top: 15px;
      width: 100%;
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
  export default {
    created() {

    },
    mounted() {

    },
    computed: {
      menuList() {
        let value = [];
        if (this.$storeHelper.menuList) {
          value = this.$storeHelper.menuList;
        }
        return value;
      },
      navMenu() {
        let value = {}
        if (this.$storeHelper.navMenu) {
          value = this.$storeHelper.navMenu;
        }
        return value;
      }
    },
    data() {
      return {
        collapseMenu: false,
      }
    },
    props: {
      activeSideMenuItem: {
        type: String,
      },
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
              this.$utils.goToPath('/index');
            default:
              this.$router.push(key);
              break;
          }
        }
      },
      toggleMenu() {
        this.collapseMenu = !this.collapseMenu;
      },
    }
  }
</script>