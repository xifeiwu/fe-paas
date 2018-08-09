<template>
  <div :class="{'nav-bar': true, collapse: isMenuHidden}">
    <div class="img" @click="handleAsideMenuSelect('index', ['index'])">
      <img src="/assets/imgs/finup-cloud-2.png">
    </div>
    <el-menu
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            @select="handleAsideMenuSelect"
            :defaultOpeneds="['app_menu']"
            :collapse="isMenuHidden"
            :defaultActive="activeSideMenuItem">
      <el-menu-item v-for="menu in menuList" :key="menu.name" :index="menu.router">
        <i :class="menu.icon"></i><span>{{menu.name}}</span>
      </el-menu-item>
      <!--<el-submenu v-for="menu in menuList2.level2" :key="menu.id" :index="menu.url || menu.name">-->
      <!--<template slot="title">-->
      <!--<i v-if="menu.icon" :class="menu.icon"></i>-->
      <!--<span>{{menu.name}}</span>-->
      <!--</template>-->
      <!--<el-menu-item v-for="subMenu in menu.children" :key="subMenu.id" :index="subMenu.url || subMenu.name">-->
      <!--<i v-if="subMenu.icon" :class="subMenu.icon"></i>-->
      <!--<span>{{subMenu.name}}</span>-->
      <!--</el-menu-item>-->
      <!--</el-submenu>-->
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
  $header-height: 45px;
  $header-background-color: #3976EF;
  $header-background-color: #e7e7e7;
  $split-line-color: #e7e7e7;
  $aside-width: 180px;

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
    box-sizing: border-box;
    width: 180px;
    height: 100%;
    float: left;
    background: $menu-background;

    .img {
      line-height: $header-height;
      cursor: pointer;
      img {
        width: 120px;
        margin-left: 12px;
        vertical-align: middle;
      }
    }

    [class^="paas-icon-"] {
      display: inline-block;
      font-size: 14px;
      margin-top: 1px;
      margin-right: 5px;
    }
    .el-menu {
      background-color: $menu-background;
      margin-top: 10px;
      border-width: 0px;
      .el-menu-item {
        color: $menu-font-color;
        font-size: 15px;
        height: 40px;
        margin: 8px 0px;
        line-height: 40px;
        &:hover {
          background-color: $menu-background-hover;
          color: $menu-font-color-hover;
        }
        &.is-active {
          color: $menu-font-color-active;
          background: $menu-background-active;
          border-radius: 0px;
          [class^="paas-icon-"] {
            /*font-size: 15px;*/
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
    computed: {
      menuList() {
        let value = [];
        if (this.$storeHelper.menuList) {
          value = this.$storeHelper.menuList;
        }
        return value;
      }
    },
    data() {
      return {
        isMenuHidden: false,
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
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>