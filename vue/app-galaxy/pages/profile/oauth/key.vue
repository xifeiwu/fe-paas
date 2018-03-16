<template>
  <div id="oauth-key">
    <el-row class="header">
      <el-col :span="4">
        <el-button
                size="mini-extral"
                type="primary"
                :load="statusOfWaitingResponse('create-access-key')"
                @click="handleButtonClick('create-access-key')">
          创建Access Key
        </el-button>
      </el-col>
      <el-col :span="20" class="key-selector">
        <div class="item">
          <label style="float: left; width: 100px; line-height: 26px">访问对方团队：</label>
          <el-select filterable v-model="searchCondition.groupID" placeholder="请选择"
                     style="display:block; max-width: 280px; margin-left: 100px;">
            <el-option v-for="(item, index) in [{id: 0, name: '所有'},{id: 1, name: 'A'},{id: 2, name: 'B'}]"
                       :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="item">
          <label style="float: left; width: 72px; line-height: 26px">访问环境：</label>
          <el-select v-model="searchCondition.production" placeholder="请选择" style="display:block; max-width: 200px; margin-left: 72px;">
            <el-option :value="true" label="生产环境"></el-option>
            <el-option :value="false" label="非生产环境"></el-option>
          </el-select>
        </div>
        <div class="item">
          <label style="float: left; width: 90px; line-height: 26px">Access Key：</label>
          <el-input v-model="searchCondition.accessKey"
                    style="display:block; width: 200px; margin-left: 90px;"></el-input>
        </div>
        <el-button size="mini-extral"
                   type="primary"
                   @click="handleButtonClick('search')">搜索</el-button>
      </el-col>
    </el-row>
    <div class="access-key-list">
      <el-table
              :data="accessKeyListByPage"
              style="width: 100%"
              v-loading="showLoading"
              element-loading-text="加载中"
      >
        <el-table-column
          prop="accessKey"
          label="Access Key"
          width="120"
          headerAlign="center" align="center">
          <template slot-scope="scope">
            <div  class="access-key">
              <span>{{scope.row.accessKey}}</span>
              <i class="my-icon-copy" v-clipboard:copy="scope.row.accessKey"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="secret"
          label="Access Secret"
          width="120"
          headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
          prop="myApp"
          label="我的应用"
          width="80"
          headerAlign="center" align="center"
        >
        </el-table-column>
        <el-table-column
          prop="appAccessStatus"
          label="访问应用信息-状态"
          width="120"
          headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
          prop="profileName"
          label="访问环境"
          width="90"
          headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
          prop="creatorName"
          label="创建人"
          width="90"
          headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                label="创建时间"
                prop="createTime"
                width="120"
                headerAlign="center" align="center">
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="warning"
                    @click="handleTRClick('config-access', scope.$index, scope.row)">
              访问配置
            </el-button>
            <el-button
                    size="mini-extral"
                    type="warning"
                    :loading="statusOfWaitingResponse('modify-secret') && selected.row.id === scope.row.id"
                    @click="handleTRClick('modify-secret', scope.$index, scope.row)">修改秘钥
            </el-button>
            <el-button
                    size="mini-extral"
                    type="danger"
                    :loading="statusOfWaitingResponse('delete') && selected.row.id === scope.row.id"
                    @click="handleTRClick('delete', scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="更改秘钥" :visible="selected.operation == 'modify-secret'"
               class="modify-secret"
               @close="selected.prop = null"
               v-if="selected.row"
    >
      <el-form :model="newProps" :rules="rules" labelWidth="160px" size="mini" ref="modifySecretForm">
        <el-form-item label="Access Key：">
          {{selected.row.accessKey}}
        </el-form-item>
        <el-form-item label="Access Secret：" prop="secret">
          <el-input v-model="newProps.secret" placeholder="中文，英文，数字，下划线，中划线。2-30个字符"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButton('modify-secret')"
                       :loading="statusOfWaitingResponse('modify-secret-in-dialog')">确&nbsp定</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="selected.operation = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  #oauth-key {
    .el-dialog__wrapper {
      &.modify-secret {
        width: 80%;
        max-width: 600px;
        margin: 15px auto;
        .el-dialog {
          width: 100%;
        }
      }
    }
    .el-row.header {
      .el-input {
        input {
          height: 26px;
        }
      }
      .el-select .el-input__inner {
        height: 26px;
      }
    }
  }
</style>
<style lang="scss" scoped>
#oauth-key {
  .el-row.header {
    margin: 5px;
    font-size: 14px;
    line-height: 20px;
    i {
      font-size: 14px;
    }
    .el-col {
      vertical-align: middle;
      .item {
        margin: 1px;
        display: inline-block;
      }
    }
  }
  .el-table {
    .access-key {
      line-height: 26px;
      text-align: center;
      .my-icon-copy {
        font-size: 16px;
        margin-left: 5px;
        &:hover {
        }
        &:active {
          color: #409EFF;
          font-weight: bold;
        }
      }
    }
    .el-button {
      margin: 2px 4px;
    }
  }
}
</style>

<script>
module.exports = {
  created() {

  },
  mounted() {

  },

  data() {
    return {
      queueForWaitingResponse: [],

      showLoading: false,
      createAccessKeyTag: null,
      searchCondition: {
        groupID: null,
        production: true,
        accessKey: ''
      },
      accessKeyListByPage: [{
        accessKey: 'fdaf',
        secret: '123456',
        myApp: '',
        appAccessStatus: '',
        requestApplicationNames: [],
        profileName: '测试环境',
        creatorName: 'A',
        status: 'fdsa',
        createTime: '2017-09-21'
      }],

      selected: {
        row: {id: null},
        operation: null,
        prop: null,
      },
      newProps: {
        secret: ''
      },
      rules: {
        secret: [{
          required: true,
          message: '内容不能为空',
        }],
      }
    }
  },

  methods: {
    // helper for loading action of el-button
    addToWaitingResponseQueue(action) {
      if (this.queueForWaitingResponse.indexOf(action) === -1) {
        this.queueForWaitingResponse.push(action);
      }
    },
    hideWaitingResponse(action) {
      let index = this.queueForWaitingResponse.indexOf(action);
      if (index > -1) {
        this.queueForWaitingResponse.splice(index, 1);
      }
    },
    statusOfWaitingResponse(action) {
      return this.queueForWaitingResponse.indexOf(action) > -1;
    },

    getEmptyItem() {
      return {
        accessKey: '',
        secret: '',
        myApp: '',
        appAccessStatus: '',
        requestApplicationNames: [],
        profileName: '测试环境',
        creatorName: '',
        status: '',
        createTime: ''
      }
    },
    handleButtonClick(action) {
      switch (action) {
        case 'create-access-key':
          this.addToWaitingResponseQueue('create-access-key');
          if (this.createAccessKeyTag) {
            let duration = new Date().getTime() - this.createAccessKeyTag;
            if (duration > 5 * 1000) {
              this.$message.warning(`请${duration/100}秒后再尝试创建！`);
              return;
            }
          }
          this.createAccessKeyTag = new Date().getTime();
          this.$net.oAuthCreateAccessKey({
            groupId: this.$storeHelper.currentGroupID
          }).then(content => {
            let item = this.getEmptyItem();
            item.createTime = content.createTime;
            item.creatorName = content.creatorName;
            item.secret = content.secret;
            item.accessKey = content.client_id;
            this.accessKeyListByPage.unshift(item);
            this.hideWaitingResponse('create-access-key');
          }).catch(msg => {
            this.hideWaitingResponse('create-access-key');
            this.$notify.error({
              title: '创建Access Key失败！',
              message: msg,
              duration: 0,
              onClose: function () {
              }
            });
          });
          break;
        case 'search':
          break;
      }
    },
    handleTRClick(action, index, row) {
      this.selected.row = row;
      this.selected.operation = action;
      switch (action) {
        case 'config-access':
          break;
        case 'modify-secret':
          this.newProps.secret = row.secret;
          break;
        case 'delete':
          this.warningConfirm('删除Oauth授权',
            '你确定要删除xx团队的xx应用Oauth授权？它将会造成授权的URL不可访问。').then(() => {
          }).catch(err => {
          });
          break;
      }
    },

    handleDialogButton(action) {
      switch (action) {
        case 'modify-secret':
          let prop = 'secret';
          let formName = 'modify' + prop.replace(/^[a-z]/g, (L) => L.toUpperCase()) + 'Form';
          this.$refs[formName].validate((valid) => {
            if (!valid) {
              return;
            }
            if (!this.newProps.hasOwnProperty(prop) || !this.selected.row.hasOwnProperty(prop)) {
              return;
            }
            if (this.newProps[prop] == this.selected.row[prop]) {
              this.selected.operation = null;
              this.$message({
                type: 'warning',
                message: '您没有做修改'
              });
            } else {
              this.requestUpdate(action, prop);
            }
          });
          break;
      }
    },

    requestUpdate(action, prop) {
      // simulate post
      this.addToWaitingResponseQueue(action + '-in-dialog');
      setTimeout(() => {
        this.hideWaitingResponse(action + '-in-dialog');
        this.selected.operation = null;
//        this.updateModelInfo(prop);
      }, 3000);
    },

    warningConfirm(title, content) {
      return new Promise((resolve, reject) => {
        this.$confirm(content, title, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          resolve();
        }).catch(() => {
          reject()
        });
      });
    },
  }
}
</script>