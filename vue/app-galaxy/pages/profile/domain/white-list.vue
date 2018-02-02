<template>
  <div id="domain-white-list">
    <div class="upload-area">
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>IP地址超过10个建议下载模板，填写完成后导入文本操作</span>
      </el-tag>
      <el-row><span>外网二级域名：</span><span>{{paramsInQueryString.domainName}}</span></el-row>
      <el-upload
              class="upload-file"
              ref="upload"
              :limit="1"
              :onExceed="onFileExceed"
              :headers="{token: this.$storeHelper.getUserInfo('token')}"
              action="$url.work_order_handle_upload_test_report"
              :auto-upload="false"
              :beforeUpload="beforeFileUpload"
              :onSuccess="afterLoadSuccess"
              :onError="afterLoadError"
              @onUploadFiles="onUploadFiles"
      >
        <el-button slot="trigger" type="primary" size="mini-extral">选取文件</el-button>
        <el-tooltip class="item" effect="dark"
                    content="只能上传以.xls或.xlsx为后缀的excel文件" placement="top-start">
          <el-button style="margin-left: 5px;" type="success" size="mini-extral"
                     @click="handleSubmitUpload">上传到服务器</el-button>
        </el-tooltip>
      </el-upload>

    </div>
    <div class="manual-area">
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
                  @click="handleRowButtonClick('add')">保存</el-button>
        </el-col>
      </el-row>
      <el-table
              :data="IPList"
              border
              style="width: 100%"
              v-clickoutside="handleClickOutsideTable"
      >
        <el-table-column
                type="index"
                label="编号"
                width="80">
        </el-table-column>
        <el-table-column
                prop="ip"
                label="IP白名单"
                width="180">
          <template slot-scope="scope">
            <el-input
                    class="input-new-tag"
                    v-if="selected.index == scope.$index && selected.operation == 'modify'"
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
                    v-if="selected.index == scope.$index && selected.operation == 'modify'"
                    v-model="selected.row.description"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.$index, scope.row)"
                    @blur="handleInputConfirm(scope.$index, scope.row)"
            >
            </el-input>
            <span v-else size="small" class="content" @click="">{{scope.row.description}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="operation" width="160"
                         headerAlign="center" align="center">
          <template slot-scope="scope">
            <el-button
                    v-if="selected.index == scope.$index && selected.operation == 'modify'"
                    size="mini-extral"
                    type="warning"
                    :loading="waitingResponse"
                    @click="handleRowButtonClick('save', scope.$index, scope.row)">保存</el-button>
            <el-button
                    size="mini-extral"
                    type="warning"
                    v-else
                    @click="handleRowButtonClick('modify', scope.$index, scope.row)">修改</el-button>
            <el-button
                    size="mini-extral"
                    type="danger"
                    @click="handleRowButtonClick('delete', scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="scss">
  #domain-white-list {
    padding: 3px;
    .upload-area {
      font-size: 14px;
      border: 1px solid lavenderblush;
      margin-bottom: 3px;
      .el-tag {
        display: block;
        width: 100%;
      }
      .upload-file {
        margin-top: 6px;
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
    .manual-area {
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
      .el-table {
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
  /*#domain-main {*/
  /*.el-table {*/
  /*td {*/
  /*padding: 0px;*/
  /*.cell {*/
  /*padding: 0px;*/
  /*}*/
  /*}*/
  /*}*/
  /*}*/
</style>

<script>
  import Clickoutside from 'element-ui/src/utils/clickoutside';
  export default {
    directives: { Clickoutside },
    created() {
    },
    mounted() {
      let queryParam = this.$route.query;
      if ('id' in queryParam && 'domainName' in queryParam) {
        this.paramsInQueryString.id = parseInt(queryParam['id']);
        this.paramsInQueryString.domainName = queryParam['domainName'];
      } else {
        this.$router.go(-1);
      }
    },
    data() {
      return {
        paramsInQueryString: {
          id: null,
          domainName: null,
        },
        itemToAdd: {
          internetDomainId: '',
          ip: '',
          description: '',
        },
        IPList: [{
          ip: '10.12.34.23',
          description: '上海市普陀区金沙江路 1518 弄',
        }, {
          ip: '12.31.233.108',
          description: '上海市普陀区金沙江路 1517 弄',
        }, {
          ip: '12.31.233.109',
          description: '上海市普陀区金沙江路 1519 弄',
        }],
        selected: {
          index: null,
          row: null,
          operation: null,
        },
        waitingResponse: false,
      }
    },
    methods: {
      handleRowButtonClick(action, index, row) {
        switch (action) {
          case 'modify':
            this.selected.operation = action;
            this.selected.index = index;
            this.selected.row = JSON.parse(JSON.stringify(this.IPList[index]));
//            row.showInput = true;
            break;
          case 'save':
            this.waitingResponse = true;
            if (this.$utils.theSame(this.selected.row, this.IPList[this.selected.index])) {
              this.$message({
                type: 'warning',
                message: '您没有做修改'
              });
              this.waitingResponse = false;
              this.selected.operation = null;
            } else {
              setTimeout(() => {
                this.waitingResponse = false;
                this.IPList[this.selected.index] = JSON.parse(JSON.stringify(this.selected.row));
                this.selected.operation = null;
              }, 1000);
            }
            break;
          case 'delete':
            break;
          case 'add':
            this.itemToAdd.internetDomainId = this.paramsInQueryString.id;
            this.$net.addItemToWhiteList(this.itemToAdd);
//            this.IPList.unshift(this.itemToAdd);
//            this.itemToAdd.ip = '';
//            this.itemToAdd.description = '';
            break;
        }
      },
      handleInputConfirm(index, row) {
        console.log('blur');
      },
      handleClickOutsideTable() {
        this.selected.operation = '';
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
        this.$message({
          type: 'success',
          message: '文件' + file.name + '上传成功！'
        });
        this.$refs.upload.clearFiles();
      },
      afterLoadError(err, file, fileList) {
        this.$message({
          type: 'success',
          message: '文件' + file.name + '上传失败！'
        });
      },
      onUploadFiles(value) {
//        console.log('onUploadFiles');
//        console.log(value);
      },
      /* end of functions used for upload file */
    }
  }
</script>