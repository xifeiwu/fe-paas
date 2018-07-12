<template>
  <div id="domain-white-list">
    <div class="header">
      <div class="domain-name" style="padding: 6px 0px;">
        <div style="font-weight: bold; display: inline-block; margin-right: 30px;">
          <span>外网二级域名：</span><span>{{domainInfo.domainName}}</span>
        </div>
        <el-checkbox v-model="domainInfo.hasIPWhiteList">
          <span style="display: inline-block;">一键开启全网访问</span>
        </el-checkbox>
      </div>
      <el-row class="upload-area" type="flex">
        <el-col :span="8" class="upload">
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
            <el-button slot="trigger" type="primary" size="mini-extral">选取文件</el-button>
            <el-tooltip class="item" effect="dark"
                        content="只能上传以.xls或.xlsx为后缀的excel文件" placement="top-start">
              <el-button style="margin-left: 5px;" type="success" size="mini-extral"
                         @click="handleSubmitUpload"><span>上传到服务器</span></el-button>
            </el-tooltip>
          </el-upload>
        </el-col>
        <el-col :span="16" class="download">
          <el-tag type="success" disable-transitions>
            <i class="el-icon-warning"></i>
            <span>IP地址超过10个建议下载模板，填写完成后导入文本操作</span>
          </el-tag>
          <el-button type="info" size="mini-extral" round>
            <a :href="$url.domain_download_white_ip_list_template.url"><i class="el-icon-download"></i><span>下载模板</span></a>
          </el-button>
        </el-col>
      </el-row>
      <el-row class="add-ip">
        <el-col :span="3">
          添加白名单
        </el-col>
        <el-col :span="6">
          <el-input placeholder="IP地址" v-model="itemToAdd.ip"></el-input>
        </el-col>
        <el-col :span="12">
          <el-input placeholder="说明" v-model="itemToAdd.description"></el-input>
        </el-col>
        <el-col :span="3">
          <el-button
                  size="mini-extral"
                  type="warning"
                  :loading = "statusOfWaitingResponse('add')"
                  @click="handleRowButtonClick('add')">保存</el-button>
        </el-col>
      </el-row>
    </div>

    <div class="white-ip-list">
      <el-table
              :data="IPList"
              style="width: 100%"
              v-loading="showLoading"
              v-clickoutside="handleClickOutsideTable"
              :height="heightOfTable"
      >
        <el-table-column
                prop="index"
                label="编号"
                width="80"
        >
        </el-table-column>
        <el-table-column
                prop="ip"
                label="IP白名单">
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
        <el-table-column
                prop="description"
                label="说明">
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
                    size="mini-extral"
                    type="warning"
                    round
                    :loading = "statusOfWaitingResponse('update')"
                    @click="handleRowButtonClick('update', scope.$index, scope.row)">更新</el-button><!--
         --><el-button
                    size="mini-extral"
                    type="warning"
                    round
                    v-else
                    @click="handleRowButtonClick('modify', scope.$index, scope.row)">修改</el-button><!--
         --><el-button
                    size="mini-extral"
                    type="danger"
                    round
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
    margin:0px 6px;
    max-width: 1200px;
    height: 100%;
    display: flex;
    flex-direction: column;
    .header {
      .domain-name {
        padding: 0px 5px;
      }
      .upload-area {
        font-size: 14px;
        border: 1px solid lavenderblush;
        margin-bottom: 3px;
        padding: 6px;
        .el-col {
          &.download {
            text-align: center;
            .el-tag {
              line-height: 26px;
              height: 28px;
            }
            .el-button {
              vertical-align: middle;
              padding: 2px 8px;
              margin-left: 10px;
              a {
                font-size: 12px;
                line-height: 16px;
                color: white;
                span, i {
                  vertical-align: middle;
                  margin: 0px;
                }
              }
            }
          }
          &.upload {
            text-align: center;
            border-right: 1px solid gainsboro;
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
        }
      }
      .add-ip.el-row {
        width: 80%;
        margin: 3px auto;
        line-height: 30px;
        .el-col {
          padding: 0px 3px;
          vertical-align: middle;
          &:first-child {
            text-align: right;
          }
        }
        font-size: 14px;
        .el-input {
          .el-input__inner {
            height: 28px;
          }
        }
      }
    }
    .white-ip-list {
      position: relative;
      flex: 1;
      .el-table {
        .el-button {
          /*float: left;*/
          margin: 1px 3px;
          margin-left: 0px;
        }
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
      let dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer && dataTransfer.hasOwnProperty('id') && dataTransfer.hasOwnProperty('internetDomain')
        && dataTransfer.hasOwnProperty('hasIPWhiteList')) {
        this.domainInfo = dataTransfer;
        this.domainInfo.domainName = dataTransfer['internetDomain'];
        this.requestWhiteIPList();
      } else {
        this.$router.go(-1);
      }

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
      // action will not trigger at first change of domainInfo.hasIPWhiteList
      'domainInfo.hasIPWhiteList': function (value, oldValue) {
        let domainID = this.domainInfo['id'];
        if (!domainID) {
          return;
        }
        if (oldValue === false && value === true) {
          this.$net.domainDeleteAllWhiteIP(domainID).then(resMsg => {
            this.$message.success(resMsg.msg);
          }).catch(err => {
            this.$notify.error({
              title: err.title,
              message: err.msg,
              duration: 0,
              onClose: function () {
              }
            })
          });
        }
        if (oldValue === true && value === false) {
          this.$net.domainAddOfficeWhiteIP(domainID).then(resMsg => {
            this.$message.success(resMsg.msg);
          }).catch(err => {
            this.$notify.error({
              title: err.title,
              message: err.msg,
              duration: 0,
              onClose: function () {
              }
            })
          });
        }
//        console.log(value);
//        console.log(oldValue);
      }
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

      checkIPFormat(ip) {
        let ipRegExp = new RegExp('^([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})\.([0-2]*[0-9]{1,2})$');
        return ipRegExp.exec(ip);
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

            if (!this.checkIPFormat(this.itemToAdd.ip)) {
              this.$message.error('ip格式不正确');
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
              if (!this.checkIPFormat(this.selected.row.ip)) {
                this.$message.error('ip格式不正确');
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
                ip: this.selected.row.ip
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
        this.showLoading = true;
        this.$net.getWhiteIPList({
          internetDomainId: this.domainInfo.id,
          start: start,
          length: length,
        }).then(content => {
          this.showLoading = false;
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
          this.showLoading = false;
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