<template>
  <div id="group-manage">
    <div class="group-list">
      <el-table :data="groupList"
                v-loading="showLoading"
                stripe
                :height="heightOfGroupList"
                :row-key="(row) => {return row.id}"
                :expand-row-keys="expandRows"
                element-loading-text="加载中">
        <el-table-column label="团队名称" prop="name" headerAlign="center" align="center" width="100">
        </el-table-column>
        <el-table-column label="团队标签" prop="tag" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column label="所属业务线LOB" prop="lobName" headerAlign="center" align="center"></el-table-column>
        <el-table-column label="创建时间" prop="createTime" headerAlign="center" align="center" width="100">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.createTime)">
              <div v-for="(item, index) in scope.row.createTime" :key="index">
                {{item}}
                </div>
            </div>
            <div v-else>{{scope.row.createTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="operation" minWidth="120" headerAlign="center" align="center">
          <template slot-scope="scope">
            <el-button
                    v-if="!$storeHelper.notPermitted['show_group_numbers']"
                    size="mini-extral"
                    type="primary"
                    @click="handleTRButton('show-group-numbers', scope.$index, scope.row)"
                    :class="{'expand': expandRows.indexOf(scope.row.id) > -1}"
                    :loading="statusOfWaitingResponse('show-group-numbers') && operation.rowID == scope.row.id">
              <span>查看成员</span>
              <i class="el-icon-arrow-right"></i>
            </el-button>
            <el-button
                    v-if="!$storeHelper.notPermitted['invite_numbers']"
                    size="mini-extral"
                    type="primary"
                    @click="handleTRButton('invite-group-number', scope.$index, scope.row)">邀请成员</el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         v-if="true"
                         width="0"
        >
          <template slot-scope="scope">
            <div class="row-expand">
              <el-table :data="userList">
                <el-table-column label="用户名" prop="username" headerAlign="center" align="center" width="100">
                </el-table-column>
                <el-table-column label="真实项目" prop="realName" headerAlign="center" align="center" width="100">
                </el-table-column>
                <el-table-column label="岗位" prop="jobDescription" headerAlign="center" align="center">
                </el-table-column>
                <el-table-column label="操作" prop="operation" headerAlign="center" align="center" width="180">
                  <template slot-scope="scope">
                    <el-button
                            size="mini-extral"
                            type="info"
                            round
                            @click="handleTRButton('change-roles', scope.$index, scope.row)"
                            :class="{'expand': expandRows.indexOf(scope.row.id) > -1}"
                            :loading="statusOfWaitingResponse('change-roles') && operation.row.id == scope.row.id">
                      <span>修改岗位</span>
                    </el-button>
                    <el-button
                            size="mini-extral"
                            type="info"
                            round
                            @click="handleTRButton('remove-group-number', scope.$index, scope.row)">移除成员</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="showAppList">
        <div class="pagination">
          <el-pagination
                  :current-page="currentPage"
                  size="large"
                  layout="prev, pager, next"
                  :page-size = "pageSize"
                  :total="totalSize"
                  @current-change="handlePaginationPageChange"
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <el-dialog title="更改岗位" :visible="operation.name == 'change-roles'"
               @close="operation.name = null;"
               class="size-750 change-roles"
    >
      <el-form :model="operation.newProps" :rules="rules" labelWidth="96px" size="mini" ref="changeJobsForm">
        <el-form-item label="当前岗位为">
          <el-tag v-for="(item, index) in operation.newProps.jobDescriptions" :key="index"
                  size="mini"
          >{{item}}</el-tag>
        </el-form-item>
        <el-form-item label="更改为" prop="jobNames">
          <el-checkbox-group v-model="operation.newProps.jobNames">
            <el-checkbox v-for="item in allJobs" :label="item.name" :key="item.name">
              {{item.description}}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButton('change-roles')"
                       >保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="operation.name = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="邀请新成员" :visible="operation.name == 'invite-group-number'"
               @close="operation.name = null;"
               class="size-650 invite-group-number"
    >
      <el-form :model="inviteGroupNumberInfo" :rules="rules" labelWidth="120px" size="mini" ref="inviteGroupNumberForm">
        <el-form-item label="请输入邮箱" prop="email">
          <el-input v-model="inviteGroupNumberInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="请输入成员岗位" prop="jobName">
          <el-select v-model="inviteGroupNumberInfo.jobName" placeholder="请选择">
            <el-option v-for="item in allJobs" :value="item.name" :label="item.description" :key="item.name" ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center">
            <el-button type="primary"
                       @click="handleDialogButton('invite-group-number')"
            >保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="operation.name = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

  </div>
</template>

<style lang="scss" scoped>
  #group-manage {
    height: 100%;
    .group-list {
      height: 100%;
      .el-table {
        tr .row-expand {
          background-color: #fff;
          box-sizing: border-box;
          /*padding: 12px 8px;*/
          width: 85%;
          margin: 0px auto;
          max-width: 750px;
          box-shadow: 0 0 2px 0 rgba(64, 158, 255, .6);
          .el-table {
            td {
              padding: 0px 0px;
            }
          }
        }
        .el-table__row {
          .el-button {
            margin: 2px 4px;
            &.expand {
              .el-icon-arrow-right {
                transform: rotate(90deg);
              }
            }
            .el-icon-arrow-right {
              vertical-align: middle;
              transition: transform 0.2s ease-in-out;
            }
            &:first-child {
              margin-left: 0px;
            }
          }
          .el-button + .el-button {
            margin-left: 0px;
          }
        }
      }
    }

    .el-dialog__wrapper {
      &.change-roles {
        .el-tag {
          margin-right: 3px;
        }
      }
    }
  }
</style>

<script>
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  module.exports = {
    created() {

    },

    mounted() {
      this.showLoading = true;
      this.$net.getGroupList().then(content => {
        if (content.hasOwnProperty('groupList')) {
          this.groupList = content.groupList;
          this.showLoading = false;
        }
      }).catch(err => {
        this.showLoading = false;
      });

      try {
        this.groupListNode = this.$el.querySelector('.group-list');
        this.heightOfGroupList = this.groupListNode.offsetHeight;
        this.resizeListenerForAppList = (evt) => {
          let target = evt.target;
          this.heightOfGroupList = target.clientHeight;
        };
        addResizeListener(this.groupListNode, this.resizeListenerForAppList);
      } catch(err) {
        console.log(err);
      }
    },
    beforeDestroy() {
      removeResizeListener(this.groupListNode, this.resizeListenerForAppList);
    },

    data() {
      return {
        groupList: [],
        showLoading: false,
        groupListNode: null,
        heightOfGroupList: '',

        pageSize: 0,
        currentPage: 1,
        pageSize: 1,
        showAppList: false,

        operation: {
          row: null,
          name: null,
          newProps: {
            jobNames: [],
          }
        },
        expandRows: [],
        userList: [],

        inviteGroupNumberInfo: {
          email: '',
          jobName: 'DEVELOP_ENGINEER'
        },

        queueForWaitingResponse: [],

        allJobs: [{
          description: "开发工程师",
          name: "DEVELOP_ENGINEER"
        }, {
          description: "测试工程师",
          name: "TESTING_ENGINEER"
        }, {
          description: "DBA",
          name: "DBA"
        }, {
          description: "TECH LEADER",
          name: "TECH_LEADER"
        }, {
          description: "PRODUCT OWNER",
          name: "PRODUCT_OWNER"
        }],
        jobNames: [],
        emailReg: this.$utils.getReg('mail'),
        rules: {
          jobNames: [{
            required: true,
            message: '用户角色不能为空',
          }],
          email: [{
            required: true,
            message: '邮箱不能为空',
          }, {
            validator: (rule, values, callback) => {
              let passed = true;
              if (!this.emailReg.exec(values)) {
                passed = false;
                callback('邮箱格式不正确');
              }
              if (passed) {
                callback();
              }
            }
          }]
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
      statusOfWaitingResponse(action) {
        return this.queueForWaitingResponse.indexOf(action) > -1;
      },
      hideWaitingResponse(action) {
        let index = this.queueForWaitingResponse.indexOf(action);
        if (index > -1) {
          this.queueForWaitingResponse.splice(index, 1);
        }
      },

      handleTRButton(action, index, row) {
        switch (action) {
          case 'show-group-numbers':
            if (!row.hasOwnProperty('id')) {
              return;
            }
            this.operation.row = row;

            // update expandRows
            let checkIfExpanded = () => {
              let hasExpanded = false;
              if (!row.hasOwnProperty('id')) {
                hasExpanded = true;
                return hasExpanded;
              }
              let key = row.id;
              // close it if has expanded
              if (this.expandRows.indexOf(key) > -1) {
                this.expandRows.splice(this.expandRows.indexOf(key), 1);
                hasExpanded = true;
              }
              return hasExpanded;
            };
            let updateExpandRows = () => {
              if (!row.hasOwnProperty('id')) {
                return;
              }
              let key = row.id;
              if (this.expandRows.indexOf(key) > -1) {
                this.expandRows.splice(this.expandRows.indexOf(key), 1);
              } else {
//                this.expandRows.push(key);
                this.expandRows = [key];
              }
            };

            if (checkIfExpanded()) {
              return;
            }

            this.addToWaitingResponseQueue(action);
            this.userList = [];
            this.$net.getGroupNumbers({id: row.id}).then(userList => {
              this.hideWaitingResponse(action);
              this.userList = userList;
              updateExpandRows();
            }).catch(err => {
              this.hideWaitingResponse(action);
            });

            break;
          case 'change-roles':
            if (!row.hasOwnProperty('jobNames') || !row.hasOwnProperty('jobDescriptions')) {
              this.$message.warning('信息不完整');
              return;
            }
            this.operation.newProps.jobNames = JSON.parse(JSON.stringify(row.jobNames));
            this.operation.newProps.jobDescriptions = JSON.parse(JSON.stringify(row.jobDescriptions));
            this.operation.row = row;
            this.operation.name = action;
            break;
          case 'invite-group-number':
            this.operation.row = row;
            this.operation.name = action;
            break;
          case 'remove-group-number':
            break;
        }
      },
      handleDialogButton(action) {
        switch (action) {
          case 'change-roles':
            this.$refs['changeJobsForm'].validate((valid) => {
              if (!valid) {
                return;
              }
              if (this.$utils.theSame(this.operation.newProps['jobNames'], this.operation.row['jobNames'])) {
                this.operation.name = null;
                this.$message({
                  type: 'warning',
                  message: '您没有做修改'
                });
              } else {
                this.requestServerForUpdate(action);
              }
//              console.log(this.operation.newProps.jobNames);
//              console.log(valid);
            });
            break;
          case 'invite-group-number':
            this.$refs['inviteGroupNumberForm'].validate((valid) => {
              if (!valid) {
                return;
              }
            });
            break;
        }
      },

      requestServerForUpdate(action) {
        switch (action) {
          case 'change-roles':
            this.$net.changeGroupNumberRoles({
              userId: this.operation.row.userId,
              groupId: this.operation.row.groupId,
              jobs: this.operation.newProps['jobNames'].join(',')
            }).then(msg => {
              this.$message.success('修改成功！');
              this.updateModelInfo(action);
            }).catch(errMsg => {
              this.$message.error('修改失败！');
            });
            break;
          case 'invite-group-number':
            this.$net.inviteGroupNumber({
              groupId: this.operation.row.id,
              emailString: this.inviteGroupNumberInfo.email,
              job: this.inviteGroupNumberInfo.jobName
            }).then(msg => {
              this.$message.success('修改成功！');
              this.operation.name = null;
            }).catch(errMsg => {
              this.$message.error('修改失败！');
              this.operation.name = null;
            });
            break;
        }

      },

      updateModelInfo(action) {
        switch (action) {
          case 'change-roles':
            let row = this.operation.row;
            let newProps = this.operation.newProps;

            let allJobsMap = {};
            this.allJobs.forEach(it => {
              allJobsMap[it.name] = it.description;
            });
            newProps['jobDescriptions'] = newProps['jobNames'].map(it => {
              let desc = allJobsMap.hasOwnProperty(it) ? allJobsMap[it] : '';
              return desc;
            });

            row['jobNames'] = this.$utils.cloneDeep(newProps['jobNames']);
            row['jobDescriptions'] = this.$utils.cloneDeep(newProps['jobDescriptions']);
            row['jobDescription'] = row['jobDescriptions'].join(',');

            this.operation.name = null;
            break;
        }
      },

      handlePaginationPageChange() {
      }
    }
  }
</script>