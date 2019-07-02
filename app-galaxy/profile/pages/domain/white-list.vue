<template>
  <div id="domain-white-list">
    <div class="header">
      <div class="domain-name">
        <div style="font-weight: bold; display: inline-block; margin-right: 30px; font-size: 14px;">
          <span>当前外网二级域名：</span><span>{{domainInfo.domainName}}</span>
        </div>
        <!--<el-checkbox v-model="allNetWorkAccessAble" @change="toggleAllNetWorkAccessAble">-->
          <!--<span style="display: inline-block;">一键开启全网访问（默认已开通各职场IP白名单）</span>-->
        <!--</el-checkbox>-->
      </div>
      <div class="bundle-operation" v-if="true" style="display: flex;">
        <div class="upload-area">
          <el-button type="info" size="mini" round class="flex">
            <a :href="$url.domain_download_white_ip_list_template.url" style="color: white"><i class="el-icon-download"></i><span>下载模板</span></a>
          </el-button>
          <el-upload
                  class="upload-file"
                  ref="upload"
                  :limit="1"
                  :onExceed="onFileExceed"
                  :headers="{token: this.$storeHelper.getUserInfo('token')}"
                  :data="{'internetDomainId': this.itemToAdd.internetDomainId}"
                  :action="$url.domain_upload_white_ip_list_template.url"
                  :auto-upload="false"
                  :beforeUpload="beforeFileUpload"
                  :onSuccess="afterLoadSuccess"
                  :onError="afterLoadError"
                  accept=".xls, .xlsx"
                  @onUploadFiles="onUploadFiles"
          >
            <el-button slot="trigger" type="primary" size="mini">选取文件</el-button>
            <el-tooltip class="item" effect="dark"
                        content="只能上传以.xls或.xlsx为后缀的excel文件" placement="bottom">
              <el-button style="margin-left: 5px;" type="success" size="mini"
                         @click="handleSubmitUpload"><span>上传到服务器</span></el-button>
            </el-tooltip>
          </el-upload>
          <el-tag type="success" disable-transitions style="line-height: 18px; height: 20px;">
            <i class="el-icon-warning"></i>
            <span>IP地址超过10个建议下载模板，填写完成后导入文本操作</span>
          </el-tag>
        </div>
      </div>
      <div class="add-ip" style="display: flex; align-items: center">
        <el-input size="mini-extral" placeholder="IP地址" v-model="itemToAdd.ip" style="max-width: 200px; margin-right: 5px;"></el-input>
        <el-input size="mini-extral" placeholder="说明" v-model="itemToAdd.description" style="max-width: 500px; margin-right: 5px;"></el-input>
        <el-button
                size="mini"
                type="warning"
                :loading = "statusOfWaitingResponse('add')"
                @click="handleRowButtonClick('add')">添加</el-button>
        <el-button
                size="mini"
                type="primary"
                :loading = "statusOfWaitingResponse('add')"
                @click="toggleCompanyWhiteList('add')">一键添加职场白名单</el-button>
        <el-button
                size="mini"
                type="primary"
                :loading = "statusOfWaitingResponse('add')"
                @click="toggleCompanyWhiteList('remove')">一键删除职场白名单</el-button>
      </div>
    </div>

    <div class="white-ip-list">
      <el-table
              :data="IPList"
              style="width: 100%"
              v-loading="showLoading"
              v-clickoutside="handleClickOutsideTable"
              :height="heightOfTable"
      >
        <el-table-column prop="index" label="编号" width="80" headerAlign="center" align="center">
        </el-table-column>
        <el-table-column prop="ip" label="IP白名单">
          <template slot-scope="scope">
            <el-input
                    class="input-new-tag"
                    v-if="selected.row && selected.row.id == scope.row.id && selected.operation == 'modify'"
                    v-model="selected.row.ip"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.$index, scope.row)"
                    @blur="handleInputConfirm(scope.$index, scope.row)"
            >
            </el-input>
            <span v-else size="small" class="content" @click="">{{scope.row.ip}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明">
          <template slot-scope="scope">
            <el-input
                    class="input-new-tag"
                    v-if="selected.row && selected.row.id == scope.row.id && selected.operation == 'modify'"
                    v-model="selected.row.description"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.$index, scope.row)"
                    @blur="handleInputConfirm(scope.$index, scope.row)"
            >
            </el-input>
            <span v-else size="small" class="content" @click="">{{scope.row.description}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="operation" width="200" headerAlign="center" align="center">
          <template slot-scope="scope">
            <el-button
                    v-if="selected.row && selected.row.id == scope.row.id && selected.operation == 'modify'"
                    size="small"
                    type="text"
                    class="warning"
                    :loading = "statusOfWaitingResponse('update')"
                    @click="handleRowButtonClick('update', scope.$index, scope.row)">更新</el-button>
            <el-button
                    size="small"
                    type="text"
                    class="warning"
                    v-else
                    @click="handleRowButtonClick('modify', scope.$index, scope.row)">修改</el-button>
            <div class="ant-divider"></div>
            <el-button
                    size="small"
                    type="text"
                    class="danger"
                    :loading = "statusOfWaitingResponse('delete') && selected.row.id === scope.row.id"
                    @click="handleRowButtonClick('delete', scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="totalSize > pageSize" :class="{'disable': showLoading}">
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
  </div>
</template>

<style lang="scss">
  #domain-white-list {
    background: white;
    height: 100%;
    max-width: 1200px;
    height: 100%;
    display: flex;
    flex-direction: column;
    .header {
      padding: 3px 5px 0px 5px;
      .domain-name {
        margin-bottom: 3px;
      }
      .upload-area {
        font-size: 14px;
        padding-right: 8px;
        border-right: 1px solid gainsboro;
        margin-bottom: 3px;
        .upload-file {
          display: inline-block;
          .el-upload-list {
            .el-upload-list__item {
              margin-top: 0px;
              &:first-child {
                margin-top: 3px;
              }
              .el-upload-list__item-name {
                color: #409EFF;
                font-size: 12px;
                line-height: 1.5;
              }
            }
          }
        }
      }
      .add-ip {
        margin-bottom: 3px;
      }
    }
    .white-ip-list {
      position: relative;
      flex: 1;
      .el-table {
        tbody {
          tr {
            height: 32px;
          }
          td {
            padding: 0px;
            .cell {
              padding: 0px;
              .content {
                padding: 0px 10px;
              }
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
</style>

<script>
  import Clickoutside from 'element-ui/src/utils/clickoutside';
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
  module.exports = {
    directives: { Clickoutside },
    created() {
    },
    mounted() {
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer && dataTransfer.hasOwnProperty('id') && dataTransfer.hasOwnProperty('internetDomain')
//        && dataTransfer.hasOwnProperty('notHaveIPWhiteList')
      ) {
        this.domainInfo = dataTransfer;
        this.domainInfo.domainName = dataTransfer['internetDomain'];
        this.itemToAdd.internetDomainId = this.domainInfo['id'];
        this.requestWhiteIPList();
        this.$storeHelper.dataTransfer = null;
      } else {
        this.$router.go(-1);
      }
      // this.allNetWorkAccessAble = this.domainInfo['notHaveIPWhiteList'];

      let headerNode = this.$el.querySelector(':scope > .header');
      this.resizeListener = () => {
        let headerHeight = headerNode.offsetHeight;
        this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
      };
      addResizeListener(this.$el, this.resizeListener)
    },
    beforeDestroy() {
      removeResizeListener(this.$el, this.resizeListener);
    },
    data() {
      return {
        resizeListener: () => {},
        heightOfTable: '',

        totalSize: 0,
        pageSize: 20,
        currentPage: 1,
        showLoading: false,

        domainInfo: {
        },
        itemToAdd: {
          internetDomainId: '',
          ip: '',
          description: '',
          groupId: this.$storeHelper.currentGroupID,
        },
        queueForWaitingResponse: [],
        IPList: [],
        selected: {
          index: null,
          row: null,
          operation: null,
        },
      }
    },
    watch: {
    },
    methods: {
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
      // the first page of pagination is 1
      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.requestWhiteIPList();
      },

      async toggleCompanyWhiteList(action) {
        let domainId = this.domainInfo['id'];
        if (!domainId) {
          console.log(`domainId not found`)
          return;
        }
        const actionName = action === 'add' ? '添加' : '删除';
        try {
          await this.$confirm(`你确定要${actionName}所有职场白名单吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          });
        } catch(err) {
          return;
        }
        switch (action) {
          case 'add':
            try {
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.domain_add_office_ip_list, {
                query: {
                  internetDomainId: domainId
                }
              });
              this.$message.success(`已${actionName}所有职场白名单！`);
              // this.$storeHelper.dataTransfer = this.domainInfo;
              this.currentPage = 1;
              this.requestWhiteIPList();
            } catch (err) {
              this.$message.error('${actionName}所有职场白名单失败！');
            }
            break;
          case 'remove':
            this.$net.requestPaasServer(this.$net.URL_LIST.domain_delete_all_white_ip, {
              query: {
                internetDomainId: domainId
              }
            }).then(resContent => {
              this.$message.success(`已${actionName}所有职场白名单！`);
              // this.$storeHelper.dataTransfer = this.domainInfo;
              this.currentPage = 1;
              this.requestWhiteIPList();
            }).catch(err => {
              this.$message.error('${actionName}所有职场白名单失败！');
            });
            break;
        }
      },

      // 检查IP地址是否正确，返回错误提示。返回null说明没有错误。
      errMsgForIpCheck(ip) {
        let errMsg = null;
        let ipRegExp = this.$utils.getReg('ipWithMask');
        let result = ipRegExp.exec(ip);
        if (result && result.length === 6) {
          if (result[5]) {
            try {
              let subDomain = parseInt(result[5].substring(1));
              if (subDomain > 32) {
                errMsg = '子网掩码长度应在0-32之间'
              }
            } catch(err) {
              errMsg = '子网掩码长度设置不正确！';
            }
          }
        } else {
          errMsg = 'ip格式不正确！'
        }
        return errMsg;
      },

      handleRowButtonClick(action, index, row) {
        switch (action) {
          case 'add':
            const ifHasExist = (toAdd) => {
              let target = null;
              this.IPList.some(it => {
                if (it.ip == toAdd.ip) {
                  target = it;
                }
                return target;
              });
              return target;
            };

            if (this.errMsgForIpCheck(this.itemToAdd.ip)) {
              this.$message.error(this.errMsgForIpCheck(this.itemToAdd.ip));
              return;
            }
            if (this.itemToAdd.description.length === 0) {
              this.$message.error('请填写说明');
              return;
            }
            if (ifHasExist(this.itemToAdd)) {
              this.$message.error(`IP "${this.itemToAdd.ip}" 已经存在，不能重复添加！`);
              return;
            }

            if (this.statusOfWaitingResponse('add')) {
              return;
            }
            this.addToWaitingResponseQueue('add');
            this.$net.addWhiteIP(this.itemToAdd).then(msg => {
              this.hideWaitingResponse('add');
              this.$message.success(msg);
              // request and refresh is a better way than un-shift operation on IPList
              this.requestWhiteIPList();
              this.itemToAdd.ip = '';
              this.itemToAdd.description = '';
            }).catch(msg => {
              this.hideWaitingResponse('add');
              this.$notify.error({
                title: '添加白名单失败！',
                message: msg,
                duration: 0,
                onClose: function () {
                }
              });
            });
            break;
          case 'modify':
            this.selected.operation = action;
//            this.selected.index = index;
            this.selected.row = JSON.parse(JSON.stringify(row));
            break;
          case 'update':
            if (this.$utils.theSame(this.selected.row, row)) {
              this.$message({
                type: 'warning',
                message: '您没有做修改'
              });
              this.selected.operation = null;
            } else {
              let description = this.selected.row.description;
              if (this.errMsgForIpCheck(this.selected.row.ip)) {
                this.$message.error(this.errMsgForIpCheck(this.selected.row.ip));
                return;
              }
              if (!description || description.length === 0) {
                this.$message.error('请填写说明');
                return;
              }
              this.addToWaitingResponseQueue('update');
              this.$net.updateWhiteIP({
                internetDomainId: this.domainInfo.id,
                description: this.selected.row.description,
                ip: this.selected.row.ip,
                groupId: this.$storeHelper.currentGroupID,
              }, this.selected.row.id).then(msg => {
                this.hideWaitingResponse('update');
                this.$message.success(msg);
//                this.IPList[this.selected.index] = JSON.parse(JSON.stringify(this.selected.row));
                this.IPList.some(it => {
                  if (it.id === this.selected.row.id) {
                    it.ip = this.selected.row.ip;
                    it.description = this.selected.row.description;
                    return true;
                  }
                  return false;
                });
                this.selected.operation = null;
              }).catch(msg => {
                this.hideWaitingResponse('update');
                this.$message.error(msg);
                this.selected.operation = null;
              });
            }
            break;
          case 'delete':
            this.selected.row = JSON.parse(JSON.stringify(row));
            this.addToWaitingResponseQueue('delete');
            this.$net.deleteWhiteIP(row.id).then(msg => {
              this.hideWaitingResponse('delete');
              this.$message.success(msg);
//              this.IPList.splice(this.selected.index, 1);
              this.requestWhiteIPList();
              this.selected.operation = null;
              this.hideWaitingResponse('delete');
            }).catch(msg => {
              this.hideWaitingResponse('delete');
              this.$message.error(msg);
              this.selected.operation = null;
            });
            break;
        }
      },
      handleInputConfirm(index, row) {
        console.log('blur');
      },
      handleClickOutsideTable() {
        this.selected.operation = '';
      },
      downloadTemplate() {
//        this.$net.downloadTemplateForWhiteIP().then(response => {
//          const content = response;
//          const blob = new Blob([content]);
//          const fileName = '测试表格123.xls';
//          if ('download' in document.createElement('a')) { // 非IE下载
//            const elink = document.createElement('a');
//            elink.download = fileName;
//            elink.style.display = 'none';
//            elink.href = URL.createObjectURL(blob);
//            document.body.appendChild(elink);
//            elink.click();
//            URL.revokeObjectURL(elink.href); // 释放URL 对象
////            document.body.removeChild(elink);
//          } else { // IE10+下载
//            navigator.msSaveBlob(blob, fileName);
//          }
//        }).catch(err => {
//        });
        window.open(this.$url.domain_download_white_ip_list_template.url, '_blank');
      },
      /**
       * get white ip list, called at:
       * 1. at start of page in function mounted
       * 2. delete white ip, add white ip
       * 3. after upload excel file success or error
       */
      requestWhiteIPList() {
        let page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        let start = page * this.pageSize;
        let length = this.pageSize;
        this.$net.getWhiteIPList({
          internetDomainId: this.domainInfo.id,
          start: start,
          length: length,
        }).then(content => {
          if (content.hasOwnProperty('whiteList')) {
            if (content.hasOwnProperty('total')) {
              this.totalSize = content['total'];
            }
            this.IPList = content['whiteList'].map((it, index) => {
              it.index = start + index + 1;
              return it;
            });
          }
        }).catch(err => {
          this.IPList = [];
        })
      },

      /* functions used for upload file */
      handleSubmitUpload() {
        this.$refs.upload.submit();
      },
      onFileExceed(file, fileList) {
//        console.log('onFileExceed');
//        console.log(file, fileList);
      },
      beforeFileUpload(file) {
        return new Promise((resolve, reject) => {
          let isExcel = false;
          if (file) {
            if (/\.xls$/.exec(file.name) || /\.xlsx$/.exec(file.name)) {
              isExcel = true;
            }
          }
          if (isExcel) {
            resolve(file);
          } else {
            reject(null);
            this.$message({
              type: 'error',
              message: '只能上传以.xls或.xlsx为后缀的excel文件'
            });
          }
        })
      },
      afterLoadSuccess(res, file, fileList) {
        if (res.hasOwnProperty('msg')) {
          this.$notify.success({
            title: `文件"${file.name}"上传成功！`,
            message: res.msg,
            duration: 10000,
            onClose: function () {
            }
          });
        } else {
          this.$message({
            type: 'success',
            message: '文件' + file.name + '上传成功！'
          });
        }

        this.$refs.upload.clearFiles();
        this.requestWhiteIPList();
      },
      afterLoadError(err, file, fileList) {
        this.$message.error({
          type: 'success',
          message: '文件' + file.name + '上传失败！'
        });
        this.requestWhiteIPList();
      },
      onUploadFiles(value) {
//        console.log('onUploadFiles');
//        console.log(value);
      },
      /* end of functions used for upload file */
    }
  }
</script>