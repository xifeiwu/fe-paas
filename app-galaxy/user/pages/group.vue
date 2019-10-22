<template>
  <div id="group-manage">
    <div class="header">
      <el-row type="flex" justify="center" align="middle">
        <el-col :span="10">
          <el-button size="mini" v-if="isAdmin"
                     type="primary"
                     @click="handleButtonClick($event, 'open_dialog_group_create')">
            <span>创建团队</span><i class="el-icon el-icon-plus" style="margin-left: 8px;"></i>
          </el-button>
          <el-button size="mini"
                     type="primary"
                     @click="handleButtonClick($event, 'refresh-list')">
            <span>刷新列表</span><i class="el-icon el-icon-refresh" style="margin-left: 8px;"></i>
          </el-button>
        </el-col>
        <el-col :span="1">
          <span>&nbsp</span>
        </el-col>
        <el-col :span="13" class="search">
          <el-input size="mini-extral" placeholder="按名称搜索团队"
                    style="max-width: 360px;"
                    v-model="filterKey">
            <i slot="prefix" class="el-icon-search"></i>
            <i :class="filterKey && filterKey.length > 0 ? 'paas-icon-close' : ''"
               slot="suffix"
               @click="evt => filterKey=''"></i>
          </el-input>
        </el-col>
      </el-row>
    </div>
    <div class="group-list">
      <el-table :data="groupListByPage"
                stripe
                :height="heightOfTable"
                :row-key="(row) => {return row.id}"
                :expand-row-keys="expandRows"
                @sort-change="sort => {tableSort = sort}"
                :defaultSort="tableSort"
                element-loading-text="加载中">
        <el-table-column label="团队名称" prop="name" headerAlign="center" align="center" minWidth="100" sortable="custom">
        </el-table-column>
        <el-table-column label="团队标签" prop="tag" headerAlign="center" align="center" width="100">
        </el-table-column>
        <el-table-column label="所属业务线LOB" prop="lobName" headerAlign="center" align="center" width="120">
          <template slot-scope="scope">
            <div v-if="scope.row.lobName">{{scope.row.lobName}}</div>
            <div v-else>无</div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="formattedCreateTime" headerAlign="center" align="center" width="140" sortable="custom">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedCreateTime)">
              <div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">
                {{item}}
                </div>
            </div>
            <div v-else>{{scope.row.formattedCreateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="operation" headerAlign="center" align="center" minWidth="100">
          <template slot-scope="scope">
            <el-button
                    v-if="isAdmin"
                    type="text" class="warning"
                    @click="handleTRClick('group_delete', scope.$index, scope.row)">
              <span>解散团队</span>
            </el-button>
            <div class="ant-divider" v-if="isAdmin"></div>
            <el-button
                    v-if="isAdmin"
                    type="text" class="warning"
                    @click="handleButtonClick($event, 'open_dialog_group_update', scope.row, scope.$index)">
              <span>修改团队</span>
            </el-button>
            <div class="ant-divider" v-if="isAdmin"></div>
            <el-button
                    v-if="!$storeHelper.notPermitted['group_member_invite']"
                    type="text" class="primary"
                    @click="handleTRClick('open_dialog_invite_group_number', scope.$index, scope.row)">
              <span>邀请成员</span>
            </el-button>
            <div class="ant-divider" v-if="!$storeHelper.notPermitted['group_member_invite']"></div>
            <el-button
                    v-if="!$storeHelper.notPermitted['group_member_list']"
                    type="text" class="primary"
                    @click="handleTRClick('show-group-numbers', scope.$index, scope.row)"
                    :class="{'expand': expandRows.indexOf(scope.row.id) > -1}"
                    :loading="statusOfWaitingResponse('show-group-numbers') && operation.group.id == scope.row.id">
              <span>查看成员</span>
              <i class="el-icon-arrow-right"></i>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand"
                         v-if="true"
                         width="0"
        >
          <template slot-scope="scope">
            <div class="row-expand">
              <el-table :data="memberListByPage" class="member-list">
                <el-table-column label="用户名" prop="username" headerAlign="center" align="center" width="100">
                </el-table-column>
                <el-table-column label="真实姓名" prop="realName" headerAlign="center" align="center" width="100">
                </el-table-column>
                <el-table-column label="岗位" prop="jobDescription" headerAlign="center" align="center">
                </el-table-column>
                <el-table-column label="角色" prop="role" headerAlign="center" align="center">
                </el-table-column>
                <el-table-column label="操作" prop="operation" headerAlign="center" align="center" width="180">
                  <template slot-scope="scope">
                    <el-button
                            v-if="!$storeHelper.notPermitted['group_member_update_roles']"
                            type="text"
                            @click="handleTRClick('change-roles', scope.$index, scope.row)"
                            :class="{'expand': expandRows.indexOf(scope.row.id) > -1, 'warning': true}"
                            :loading="statusOfWaitingResponse('change-roles') && operation.menber.id == scope.row.id">
                      <span>修改岗位</span>
                    </el-button>
                    <div class="ant-divider" v-if="!$storeHelper.notPermitted['group_member_update_roles']"></div>
                    <el-button
                            v-if="!$storeHelper.notPermitted['group_member_remove']"
                            type="text"
                            class="warning"
                            @click="handleTRClick('remove-group-number', scope.$index, scope.row)">移除成员</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container" v-if="memberPagination.totalSize > memberPagination.pageSize">
                <div class="pagination">
                  <el-pagination
                          :current-page="memberPagination.currentPage"
                          size="small"
                          background
                          layout="pager"
                          :page-size = "memberPagination.pageSize"
                          :total="memberPagination.totalSize"
                          @current-change="handlePaginationPageChangeForMemberList"
                  >
                  </el-pagination>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="totalSize > pageSize">
        <div class="pagination">
          <el-pagination
                  @size-change="val => this.pageSize = val"
                  :current-page="currentPage"
                  size="small"
                  :page-size = "pageSize"
                  :page-sizes="[10, 15, 20, 30]"
                  :total="totalSize"
                  layout="total, sizes, prev, pager, next"
                  @current-change="page => {currentPage = page}"
                  v-if="totalSize > pageSize"
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
                       @click="handleDialogEvent($event, 'change-roles')"
                       >保&nbsp存</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center">
            <el-button @click="operation.name = null">取&nbsp消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="邀请新成员" :visible="action.name == 'open_dialog_invite_group_number'"
               v-if="action.name == 'open_dialog_invite_group_number'"
               @close="closeDialog"
               bodyPadding="6px 10px 0px 2px"
               class="size-650 open_dialog_invite_group_number"
    >
      <el-form :model="action.data" :rules="rules" labelWidth="120px" size="mini" ref="inviteGroupNumberForm">
        <el-form-item label="请输入邮箱" prop="email">
          <el-input v-model="action.data.email"></el-input>
        </el-form-item>
        <el-form-item label="请输入成员岗位" prop="jobName">
          <el-select v-model="action.data.jobName" placeholder="请选择">
            <el-option v-for="item in allJobs" :value="item.name" :label="item.description" :key="item.name" ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
          <div class="item">
            <el-button type="primary" size="mini" @click="handleDialogEvent($event, action.name.replace('open_dialog_', ''))">保&nbsp存</el-button>
          </div>
          <div class="item">
            <el-button size="mini" @click="closeDialog">取&nbsp消</el-button>
          </div>
      </div>
    </el-dialog>

    <el-dialog :title="{
              open_dialog_group_create: '创建团队',
              open_dialog_group_update: '修改团队'
            }[action.name]" :visible="['open_dialog_group_create', 'open_dialog_group_update'].includes(action.name)"
               v-if="['open_dialog_group_create', 'open_dialog_group_update'].includes(action.name)"
               @close="closeDialog"
               bodyPadding="6px 10px 0px 2px"
               class="size-600 create_group"
    >
      <el-form :model="action.data" :rules="rulesCreateGroup" labelWidth="100px" size="mini" ref="createGroupForm">
        <el-form-item label="团队名称" prop="groupName">
          <el-input v-model="action.data.groupName"></el-input>
        </el-form-item>
        <el-form-item label="团队标签" prop="groupTag">
          <el-input v-model="action.data.groupTag" placeholder="字母数字下划线" :disabled="action.name == 'open_dialog_group_update'"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary" size="mini" @click="handleDialogEvent($event, action.name.replace('open_dialog_', ''))">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button size="mini" @click="closeDialog">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<style lang="scss">
  #group-manage .row-expand .el-table thead tr {
    background-color: #ddd;
  }

  #group-manage .row-expand .pagination-container .pagination .el-pagination .el-pager li {
    height: 18px;
    &.number {
      line-height: 18px;
    }
  }
</style>
<style lang="scss" scoped>
  #group-manage {
    height: 100%;
    display: flex;
    flex-direction: column;
    .header {
      padding: 3px 5px;
      font-size: 14px;
      .el-row {
        .el-col {
          &.search {
            text-align: right;
            .el-input {
              margin-left: 5px;
            }
          }
        }
      }
    }
    .group-list {
      flex: 1;
      /*height: 100%;*/
      position: relative;
      .el-table {
        td {
          padding: 3px;
        }
        tr .row-expand {
          position: relative;
          width: 85%;
          max-width: 750px;
          background-color: #fff;
          box-sizing: border-box;
          padding: 0px 0px 20px 0px;
          margin: 3px auto 5px;
          /*box-shadow: 0 0 2px 0 rgba(64,158,255, .6);*/
          /*border: 1px solid #dfe1e5;*/
          box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);
          .el-table {
            td {
              padding: 0px 0px;
            }
            thead tr {
               background-color: red;
            }
          }
        }
        .el-table__row {
          .el-button {
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
  import commonUtils from 'assets/components/mixins/common-utils';

  const defaultTableSort = {
    prop: 'formattedCreateTime',
    order: 'descending',
  };
  module.exports = {
    mixins: [commonUtils],
    created() {
    },

    async mounted() {
      this.getGroupListByPage({
        refresh: true,
        currentPage: 1
      });

      this.onScreenSizeChange(this.$storeHelper.screen.size);
    },

    data() {
      return {
        isAdmin: true,
        filterKey: '',
        tableSort: defaultTableSort,
        groupList: [],
        groupListByPage: [],
        groupListNode: null,

        totalSize: 0,
        pageSize: 14,
        currentPage: 1,
        showGroupList: true,
        heightOfTable: '',

        showMemberList: true,
        memberPagination: {
          totalSize: 0,
          pageSize: 8,
          currentPage: 1,
        },


        operation: {
          group: null,
          member: null,
          name: null,
          newProps: {
            jobNames: [],
          }
        },
        expandRows: [],
        memberList: [],

        allJobs: this.$storeHelper.JOB_LIST,
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
        },
        rulesCreateGroup: {
          groupName: [{
            required: true,
            message: '团队名称不能为空',
          }],
          groupTag: [{
            required: true,
            message: '团队标签不能为空',
          }]
        }
      }
    },
    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
      currentPage(page) {
        this.getGroupListByPage({
          currentPage: page
        });
      },
      pageSize() {
        this.getGroupListByPage({});
      },
      filterKey() {
        this.getGroupListByPage({});
      },
      tableSort() {
        this.getGroupListByPage({});
      }
    },

    methods: {
      onScreenSizeChange(size) {
        if (!size) {
          return;
        }
        try {
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight - 24;
        } catch(err) {
        }
      },

      async handleDialogEvent(evt, action) {
        switch (action) {
          case 'change-roles':
            this.$refs['changeJobsForm'].validate((valid) => {
              if (!valid) {
                return;
              }
              if (this.$utils.theSame(this.operation.newProps['jobNames'], this.operation.menber['jobNames'])) {
                this.operation.name = null;
                this.$message({
                  type: 'warning',
                  message: '您没有做修改'
                });
              } else {
                this.requestServerForUpdate(action);
              }
            });
            break;
          case 'invite_group_number':
            try {
              await this.$refs['inviteGroupNumberForm'].validate();
              this.action.promise.resolve(this.action.data);
            } catch (err) {}
            break;
          case 'group_create':
          case 'group_update':
            try {
              await this.$refs['createGroupForm'].validate();
              this.action.promise.resolve(this.action.data);
            } catch (err) {}
            break;
        }
      },

      async handleButtonClick(evt, action, data) {
        switch (action) {
          case 'open_dialog_group_create':
          case 'open_dialog_group_update':
            try {
              const dialogData = await this.openDialog(action, {
                groupName: action == 'open_dialog_group_update' ? data.name : '',
                groupTag: action == 'open_dialog_group_update' ? data.tag : ''
              });
              await this.$net.requestPaasServer({
                open_dialog_group_create: this.$net.URL_LIST.group_create,
                open_dialog_group_update: this.$net.URL_LIST.group_update
              }[action], {
                payload: {
                  open_dialog_group_update: {
                    id: data ? data.id : null,
                    name: dialogData.groupName
                  },
                  open_dialog_group_create: {
                    name: dialogData.groupName,
                    tag: dialogData.groupTag,
                    description: ''
                  }
                }[action]
              });

              this.$message.success({
                open_dialog_group_create: `添加团队 "${dialogData.groupName}" 成功！`,
                open_dialog_group_update: `修改团队 "${data ? data.name : ''}" 成功`
              }[action]);
              this.handleButtonClick(null, 'refresh-list');
            } catch (err) {
              console.log(err);
            } finally {
              this.closeDialog();
            }
            break;
          case 'refresh-list':
            this.getGroupListByPage({
              refresh: true,
              currentPage: 1
            });
            break;
        }
      },

      async handleTRClick(action, index, row) {
        let dialogData = null;
        this.operation.group = row;
        switch (action) {
          case 'show-group-numbers':
            if (!row.hasOwnProperty('id')) {
              return;
            }
            let group = row;
            this.operation.group = row;

            // update expandRows
            let checkIfExpanded = () => {
              let hasExpanded = false;
              if (!group.hasOwnProperty('id')) {
                hasExpanded = true;
                return hasExpanded;
              }
              let key = group.id;
              // close it if has expanded
              if (this.expandRows.indexOf(key) > -1) {
                this.expandRows.splice(this.expandRows.indexOf(key), 1);
                hasExpanded = true;
              }
              return hasExpanded;
            };
            let updateExpandRows = () => {
              if (!group.hasOwnProperty('id')) {
                return;
              }
              let key = group.id;
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
            this.memberList = [];
            this.$net.getGroupMembers({id: group.id}).then(memberList => {
              this.hideWaitingResponse(action);
              this.memberList = memberList;
              this.memberPagination.totalSize = this.memberList.length;
              this.memberPagination.currentPage = 1;
              this.updateMemberListByPage();
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
            this.operation.menber = row;
            this.operation.name = action;
            break;
          case 'open_dialog_invite_group_number':
            try {
              dialogData = await this.openDialog(action, {
                email: '',
                jobName: this.allJobs[0]['name'],
              });

              await this.$net.requestPaasServer(this.$net.URL_LIST.group_invite_new, {
                payload: {
                  groupId: this.operation.group.id,
                  emailString: dialogData.email,
                  job: dialogData.jobName
                }
              });

              this.$message.success(`成功邀请成员：${dialogData.email}`);

              this.requestGroupNumbers(this.operation.group);
            } catch (err) {
            } finally {
              this.closeDialog();
            }
            break;
          case 'remove-group-number':
            this.operation.menber = row;
            this.operation.name = action;
//            console.log(this.operation.group);
//            console.log(this.operation.menber);
            this.warningConfirm(`将要删除"${this.operation.group.name}"的成员"${this.operation.menber.realName}"，确定吗？`).then(() => {
              this.$net.removeGroupNumber({
                groupId: this.operation.menber.groupId,
                userId: this.operation.menber.userId
              }).then(msg => {
                this.requestGroupNumbers(this.operation.group);
                this.$message.success('移除成员成功！');
                this.operation.name = null;
              }).catch(errMsg => {
                this.$message.error('移除成员失败！');
                this.operation.name = null;
              });
            });
            break;
          case 'group_delete':
            try {
              await this.$confirm(`确定要删除团队${row.name}吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              await this.$net.requestPaasServer(this.$net.URL_LIST.group_delete, {
                payload: {
                  id: row.id
                }
              });
              this.$message.success(`团队 "${row.name}" 删除成功`);
              this.handleButtonClick(null, 'refresh-list');
            } catch (err) {
//              this.$message.success(`删除失败：${(err && err.message) ? err.message : ''}`);
            }
            break;
        }
      },

      // 请求组内成员
      requestGroupNumbers(group) {
        this.memberList = [];
        this.$net.getGroupMembers({id: group.id}).then(memberList => {
          this.memberList = memberList;
          this.memberPagination.currentPage = 1;
          this.updateMemberListByPage();
          if (group.hasOwnProperty('id')) {
            this.expandRows = [group.id];
          }
        }).catch(err => {
        });
      },

      requestServerForUpdate(action) {
        switch (action) {
          case 'change-roles':
            this.$net.changeGroupNumberRoles({
              userId: this.operation.menber.userId,
              groupId: this.operation.menber.groupId,
              jobs: this.operation.newProps['jobNames'].join(',')
            }).then(msg => {
              this.$message.success('修改成功！');
              this.updateModelInfo(action);
            }).catch(errMsg => {
              this.$message.error('修改失败！');
            });
            break;
        }
      },

      updateModelInfo(action) {
        switch (action) {
          case 'change-roles':
            let row = this.operation.menber;
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

      async requestGroupList() {
        // draw: 1, start: 0, length: 10
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.group_list_by_page, {
          payload: {},
        });
        const groupList = resContent['groupList'].map(it => {
          it.formattedCreateTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
//          if (it.createTime) {
//            it.createTime = it.createTime.split(' ');
//          }
          return it;
        });
        this.groupList = groupList;
        this.totalSize = this.groupList.length;
        this.currentPage = 1;
      },

      /**
       * 获取分页的团队列表
       * @param refresh, request service list from server or not
       * @param currentPage, set currentPage by code
       */
      async getGroupListByPage({refresh = false, currentPage = null}) {
        if (refresh) {
//          this.currentPage = 1;
          this.tableSort = defaultTableSort;
          await this.requestGroupList();
        }
        if (currentPage) {
          this.currentPage = currentPage;
        }
        // check currentPage after item delete
        const maxPageSize = Math.ceil(this.totalSize / this.pageSize);
        if (this.currentPage > maxPageSize) {
          this.currentPage = maxPageSize;
        }

        var page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;

        var filterReg = null;
        if (this.filterKey) {
          filterReg = new RegExp(this.filterKey);
        }
        const filteredGroupList = this.groupList.filter(it => {
          var result = true;
          if (filterReg) {
            const searchField = `${it.name}${it.tag}${it.lobName}`;
            result = filterReg.test(searchField.toLowerCase());
          }
          return result;
        });

        // sort
        const keyMap = {
          'formattedCreateTime': 'createTime',
          'name': 'name'
        };
        const key = keyMap[this.tableSort.prop];
        const sortedGroupList = filteredGroupList;
        if (key) {
          sortedGroupList.sort((pre, next) => {
            var result = pre[key] - next[key];
            if (key === 'name') {
              result = pre[key].localeCompare(next[key]);
            }
            switch (this.tableSort['order']) {
              case 'ascending':
                break;
              case 'descending':
                result = -1 * result;
                break;
              default:
                result = 0;
                break;
            }
            return result;
          });
        }

        this.totalSize = sortedGroupList.length;
        this.groupListByPage = sortedGroupList.slice(start, end);
      },

      handlePaginationPageChangeForMemberList(page) {
        this.memberPagination.currentPage = page;
        this.updateMemberListByPage();
      },

      updateMemberListByPage() {
        let page = this.memberPagination.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.memberPagination.pageSize;
        let length = this.memberPagination.pageSize;
        let end = start + length;
        this.memberListByPage =  this.memberList.slice(start, end);
      },
    }
  }
</script>