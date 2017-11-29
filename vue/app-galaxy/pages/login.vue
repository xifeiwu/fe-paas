<template>
  <el-container>
    <el-header>
      <div class="img">picture</div>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <el-menu-item index="1">凡普云首页</el-menu-item>
        <!--<el-submenu index="2">-->
          <!--<template slot="title">我的工作台</template>-->
          <!--<el-menu-item index="2-1">选项1</el-menu-item>-->
          <!--<el-menu-item index="2-2">选项2</el-menu-item>-->
          <!--<el-menu-item index="2-3">选项3</el-menu-item>-->
        <!--</el-submenu>-->
        <el-menu-item index="3"><a href="https://www.ele.me" target="_blank">帮助文档</a></el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <div class="form-container">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item class="login-title" labelWidth="0px">登录凡普云</el-form-item>
          <el-form-item labelWidth="0px">
            <el-input v-model="form.name" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item labelWidth="0px">
            <el-input v-model="form.password" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item labelWidth="0px">
            <el-input v-model="form.password" placeholder="请输入验证码"></el-input>
          </el-form-item>
          <el-form-item class="login-interval" labelWidth="0px">
            <el-checkbox v-model="checked"
                         label="without_login"
                         name="without_login"
                         @change="checkboxChange">15天免登录</el-checkbox>
          </el-form-item>
          <el-form-item class="login-button" labelWidth="0px">
            <el-button type="primary" @click="onSubmit">登 录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-main>
    <el-footer>Copyright © 2017 凡普金科</el-footer>
  </el-container>
</template>
<script>
  import ElRow from "../../packages/row/src/row";
  export default {
    components: {ElRow}, data() {
      return {
        activeIndex: '1',
        activeIndex2: '1',
        form: {
          name: '',
          password: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        checked: false
      };
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      },
      onSubmit() {
        console.log('submit!');
      },
      checkboxChange: function () {
        console.log("checkboxChange");
        console.log(arguments);
      }
    }
  }
</script>
<style lang="scss" scoped>
  .el-container {
    .el-header {
      background-color: #e7e7e7;
      color: #333;
      text-align: center;
      line-height: 60px;
      .img {
        float: left;
      }
      .el-menu {
        background-color: transparent;
        float: right;
      }
    }

    .el-main {
      position: relative;
      color: #333;
      .form-container {
        float: right;
        margin-top: 50px;
        margin-right: 30px;
        padding: 20px;
        box-shadow: 0 0 8px 0 rgba(232,237,250,.6), 0 2px 4px 0 rgba(232,237,250,.5);
        .el-form {
          width: 320px;
          .el-form-item {
            margin-bottom: 16px;
            &.login-title {
              text-align: center;
              font-weight: bold;
              .el-form-item__content {
                font-size: 2rem !important;
              }
            }
            &.login-interval {
              .el-form-item__content {
                line-height: 24px;
              }
            }
            &.login-button {
              text-align: center;
            }
            &:last-child {
              margin-bottom: 0px;
            }
            .el-form-item__content {
              margin-left: 0px !important;
              input {
                border-radius: 0px
              }
            }
          }
        }
      }
    }

    .el-footer {
      text-align: center;
    }

    .el-aside {
      background-color: #D3DCE6;
      color: #333;
      text-align: center;
    }
  }



  body > .el-container {
    margin-bottom: 40px;
  }

</style>