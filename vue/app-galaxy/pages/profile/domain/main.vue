<template>
  <div id="domain-main">
    <div class="header">
      <div class="row"><el-version-selector></el-version-selector></div>
      <div class="row">
        <el-button
                size="mini-extral"
                type="primary"
                @click="handleButtonClick('new-domain')">
          创建外网二级域名
        </el-button>

        <el-button
                size="mini-extral"
                type="warning"
                @click="handleButtonClick('bind-service')">绑定服务
        </el-button>
        <el-button
                size="mini-extral"
                type="warning"
                @click="handleButtonClick('unbind-service')">解绑服务
        </el-button>

        <el-tooltip slot="trigger" effect="dark" placement="bottom-start">
          <div slot="content">
            <div>已绑定的域名需要先进行解绑，才可绑定新的服务</div>
          </div>
          <i class="el-icon-question"></i>
      </el-tooltip>
      </div>
    </div>
    <div class="domain-list">
      <el-table
              :data="currentDomainList"
              style="width: 100%"
              @selection-change="handleSelectionChangeInTable"
      >
        <el-table-column
                type="selection"
                width="55">
        </el-table-column>
        <el-table-column
                prop="domain"
                label="外网二级域名"
                width="180">
        </el-table-column>
        <el-table-column
                prop="createTime"
                label="创建时间"
                width="180">
        </el-table-column>
        <el-table-column
                prop="creator"
                label="创建人"
                width="160">
        </el-table-column>
        <el-table-column
                prop="status"
                label="状态"
                width="160"
        >
        </el-table-column>
        <el-table-column
                prop="operation"
                label="操作"
                width="360px"
        >
          <template slot-scope="scope">
            <el-button
                    size="mini-extral"
                    type="warning"
                    @click="handleRowButtonClick('to-white-list', scope.$index, scope.row)">
              绑定IP白名单
            </el-button>
            <el-button
                    size="mini-extral"
                    type="danger"
                    @click="handleRowButtonClick('remove', scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="创建外网二级域名" :visible="selected.operation == 'new-domain'"
               class="new-domain"
               @close="selected.operation = null"
    >
      <!--<el-tag type="success" disable-transitions>-->
        <!--<i class="el-icon-warning"></i>-->
        <!--<span>更改健康检查后需要重新【部署】才能生效！</span>-->
      <!--</el-tag>-->
      <el-form :model="newProps" :rules="rules" size="mini"
               label-width="120px" ref="newDomainForm">
        <el-form-item label="当前文件存储" class="has-existed">
          <div>
            <el-tag
                    v-for="domain in newProps.domainList"
                    :key="domain"
                    closable
                    type="success"
                    @close="handleNewDomainDialog('remove', domain)"
            >{{domain}}</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="外网二级域名" prop="level2">
          <el-input v-model="newProps.level2"></el-input>
          <el-select v-model="newProps.level1">
            <el-option value=".finupgroup.com" label=".finupgroup.com"></el-option>
            <el-option value="iqianzhan.com" label=".iqianzhan.com"></el-option>
            <el-option value=".iqianjin.com" label=".iqianjin.com"></el-option>
          </el-select>
          <el-button class="add-domain-btn" size="mini" @click="handleNewDomainDialog('add')">添加</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('new-domain')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="selected.operation = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="绑定服务" :visible="selected.operation == 'bind-service'"
               class="bind-service"
               @close="selected.operation = null"
    >
      <el-form size="mini"
               label-width="120px" ref="bindServiceForm">
        <el-form-item label="当前文件存储" class="has-existed">
          <div>
            <span
                    v-for="(item, index) in rowsSelected"
                    :key="index"
            >{{item.domain}}</span>
          </div>
        </el-form-item>
        <el-form-item label="绑定服务">
          <el-version-selector></el-version-selector>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('bind-service')"
                       :loading="waitingResponse">保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="selected.operation = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="解绑服务" :visible="selected.operation == 'unbind-service'"
               class="unbind-service"
               @close="selected.operation = null"
    >
      <div>解绑会造成外网二级域名不可用，你确定需要这么做吗？</div>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButtonClick('unbind-service')"
                       :loading="waitingResponse">保&nbsp存</el-button>
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
  #domain-main {
    .header {
      .el-select .el-input__inner {
        height: 24px;
      }
    }
    .el-dialog__wrapper {
      &.new-domain, &.bind-service {
        /*max-width: 900px;*/
        width: 80%;
        margin: 15px auto;
      }
    }
  }
</style>
<style lang="scss" scoped>
  #domain-main {
    .header {
      margin: 5px;
      font-size: 14px;
      .row {
        margin-bottom: 5px;
      }
      .el-icon-question {
        font-size: 16px;
        line-height: 24px;
        margin-left: 10px;
      }
    }
  }

</style>

<script>
  import elVersionSelector from '../utils/components/version-selector.vue';
  import StoreHelper from '../utils/store-helper.vue';
  import ElInput from "../../../../packages/input/src/input";
  import ElSelect from "../../../../packages/select/src/select";
  import ElOption from "../../../../packages/select/src/option";
  import ElTooltip from "../../../../packages/tooltip/src/main";
  export default {
    components: {ElTooltip, ElOption, ElSelect, ElInput, elVersionSelector},
    mixins: [StoreHelper],
    created() {
    },
    data() {
      return {
        currentDomainList: [{
          domain: 'www.finupgroup.com',
          createTime: '2017-06-06',
          creator: 'me',
          status: '生效中',
        }],
        rowsSelected: [],

        selected: {
          operation: null,
          row: null,
        },
        newProps: {
          domainList: [],
          level1: '.finupgroup.com',
          level2: '',
        },
        rules: {
          domainList: [{
            type: 'array',
            required: true,
            message: '请输入至少一个域名',
          }, {
            validator(rule, values, callback) {
              // console.log(rule);
              // console.log(values);
              // console.log(typeof(values));

//              let passed = true;
//              let reg = /^\/[A-Za-z0-9_\-]+$/;
//              for (let key in values) {
//                let item = values[key];
//                if (!reg.exec(item)) {
//                  passed = false;
//                  callback(`${item}不符合条件。请以/开头，可包含字母、数字、下划线、中划线，2-18位字符。`)
//                }
//              }
//              if (passed) {
//                callback();
//              }
              callback();
            }
          }],
          level2: [{
            validator(rule, values, callback) {
              let passed = false;
              if (typeof(values) == 'string' && values.length > 0) {
                passed = true;
                callback();
              } else {
                passed = false;
                callback('请填写域名！');
              }
            },
            trigger: 'blur'
          }]
        },
        waitingResponse: false,
      }
    },
    watch: {
    },
    methods: {
      handleSelectionChangeInTable(val) {
        this.rowsSelected = val;
      },
      handleRowButtonClick(action, index, row) {
        switch (action) {
          case 'to-white-list':
            let domain = row.domain;
            this.$router.push({
              path: '/profile/domain/white-list',
              query: {
                domain: domain,
              }
            });
            break;
          case 'remove':
            this.warningConfirm('删除外网二级域名将同时删除该域名关联的IP白名单，确定吗？').then(() => {
//              this.$net.deleteAPP({
//                groupId: this.currentGroupID,
//                id: row.appId
//              }).then(res => {
//                this.deleteAppInfoByID(row.appId);
//                this.$message({
//                  type: 'success',
//                  message: '删除成功!'
//                });
//                this.requestAPPList({});
//              });
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '您已取消删除'
              });
            });

            break;
        }
      },

      /**
       * do some init action before dialog popup
       */
      handleButtonClick(action) {
        switch (action) {
          case 'new-domain':
            this.selected.operation = 'new-domain';
            console.log(this.selected);
            break;
          case 'bind-service':
            if (this.rowsSelected.length == 0) {
              this.$message.warning('请先选择要操作的域名');
              return;
            }
            this.selected.operation = 'bind-service';
            break;
          case 'unbind-service':
            if (this.rowsSelected.length == 0) {
              this.$message.warning('请先选择要操作的域名');
              return;
            }
            this.selected.operation = 'unbind-service';
            break;
        }
      },
      /**
       * action in popup dialog on the press of button-ok
       * @param action
       */
      handleDialogButtonClick(action) {
        switch (action) {
          case 'new-domain':
            this.newProps.newDomain = [];
            this.waitingResponse = true;
            console.log(this.newProps);
            setTimeout(() => {
              this.waitingResponse = false;
            }, 2000);
            break;
          case 'bind-service':
            this.waitingResponse = true;
            setTimeout(() => {
              this.waitingResponse = false;
            }, 2000);
            break;
          case 'unbind-service':
            this.waitingResponse = true;
            setTimeout(() => {
              this.waitingResponse = false;
            }, 2000);
            break;
        }
      },

      /**
       * action for add or remove domain
       * @param action
       * @param domain
       */
      handleNewDomainDialog(action, domain) {
        switch (action) {
          case 'remove':
            let items = this.newProps.domainList;
            items.splice(items.indexOf(domain), 1);
            break;
          case 'add':
            this.$refs.hasOwnProperty('newDomainForm') &&
            this.$refs['newDomainForm'].validate(valid => {
              if (valid) {
                let items = this.newProps.domainList;
                let domain = this.newProps.level2 + this.newProps.level1;
                if (items.indexOf(domain) > -1) {
                  items.splice(items.indexOf(domain), 1);
                }
                items.push(domain);
                this.newProps.level2 = '';
              }
            });
            break;
        }
      },

      warningConfirm(content) {
        return new Promise((resolve, reject) => {
          this.$confirm(content, '提示', {
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