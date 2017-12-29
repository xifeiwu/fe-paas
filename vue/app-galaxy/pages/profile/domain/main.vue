<template>
  <div id="domain-main">
    <div class="upload-area">
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>IP地址超过10个建议下载模板，填写完成后导入文本操作</span>
      </el-tag>
      <el-row>外网二级域名：yujian.finupgroup.com</el-row>
      <el-upload
              class="upload-file"
              ref="upload"
              action="http://localhost:4291/post/upload"
              :multiple="true"
              :autoUpload="true"
              :auto-upload="false"
              :beforeUpload="beforeUploadFile"
              :onSuccess="afterSuccessLoad"
      >
        <el-tooltip class="item" slot="trigger" effect="dark" content="只能上传以.xls或.xlsx为后缀的excel文件" placement="top-start">
          <el-button size="mini-extral" type="primary">上传文件</el-button>
        </el-tooltip>
        <el-button size="mini-extral" type="success">下载模板</el-button>
        <!--<el-button style="margin-left: 10px;" size="mini-extral" type="success" @click="handleUploadClick">上传到服务器</el-button>-->
        <!--<div slot="tip" class="el-upload__tip" style="color: #67c23a">只能上传jpg/png文件，且不超过500kb</div>-->
      </el-upload>
    </div>
    <div class="manual-area">
      <el-row class="add-ip">
        <el-col :span="3">
          添加白名单
        </el-col>
        <el-col :span="6">
          <el-input placeholder="IP地址" v-model="ip"></el-input>
        </el-col>
        <el-col :span="12">
          <el-input placeholder="说明" v-model="description"></el-input>
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
  #domain-main {
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
    data() {
      return {
        ip: '',
        description: '',
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
            this.IPList.unshift({
              ip: this.ip,
              description: this.description
            });
            this.ip = '';
            this.description = '';
        }
      },
      handleInputConfirm(index, row) {
        console.log('blur');
//        this.selected.operation = '';
      },
      handleClickOutsideTable() {
        this.selected.operation = '';
      },
      handleUploadClick() {
        this.$refs.upload.submit();
      },
      beforeUploadFile(file) {
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
      afterSuccessLoad(res, file, fileList) {
        console.log(res);
        this.$message({
          type: 'success',
          message: '文件' + file.name + '上传成功！'
        });
      }
    }
  }
</script>