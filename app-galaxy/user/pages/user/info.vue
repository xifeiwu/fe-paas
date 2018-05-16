<template>
  <div id="user-info">
    <div class="container">
      <el-row type="flex" class="section">
        <img src="assets/imgs/default-icon.png">
        <div class="user">
          <div class="name"><span>{{userName}}</span></div>
          <div class="role"><span>用户角色：</span><span>{{userRole}}</span></div>
        </div>
      </el-row>
      <el-row class="section">
        <div class="title">凡普云产品</div>
        <el-row class="list">
          <el-col :span="6">
            <span>应用引擎</span>
            <img src="/assets/imgs/index/docker.png">
          </el-col>
        </el-row>
      </el-row>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  #user-info {
    .container {
      width: 800px;
      margin-left: 20px;
      margin-top: 20px;
      .el-row.section {
        box-shadow: 0 0 8px 0 rgba(232, 237, 250, 0.6), 0 2px 4px 0 rgba(232, 237, 250, 0.5);
        padding: 8px;
        &:nth-child(1) {
          .user {
            margin-left: 20px;
            padding: 8px;
            .name {
              font-size: 20px;
              font-weight: bold;
            }
            .role {
              font-size: 14px;
            }
          }
        }
        &:nth-child(2) {
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
  }
</style>
<script>
  export default {
    created() {

    },
    mounted() {
      this.userRole = this.$storeHelper.getUserInfo('role');
    },
    data() {
      return {
        userRole: '未知'
      }
    },
    computed: {
      userName() {
        let userName = this.$storeHelper.getUserInfo('realName');
        if (!userName) {
          userName = '未知';
        }
        return userName;
      }
    }
  }
</script>