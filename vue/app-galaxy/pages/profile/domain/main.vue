<template>
  <div id="domain-name">
    <div class="upload-file">
      <el-tag type="success" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>IP地址超过10个建议下载模板，填写完成后导入文本操作</span>
      </el-tag>
      <el-row>外网二级域名：yujian.finupgroup.com</el-row>
    </div>
    <el-table
            :data="IPList"
            border
            style="width: 100%"
            v-clickoutside="handleClickOutsideTable"
    >
      <el-table-column
              prop="id"
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
</template>

<style lang="scss">
  #domain-name {
    padding: 3px;
    .upload-file {
      border: 1px solid lavenderblush;
      margin-bottom: 3px;
      .el-tag {
        display: block;
        width: 100%;
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
</style>
<style lang="scss" scoped>
  /*#domain-name {*/
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
        IPList: [{
          id: 1,
          ip: '10.12.34.23',
          description: '上海市普陀区金沙江路 1518 弄',
        }, {
          id: 2,
          ip: '12.31.233.108',
          description: '上海市普陀区金沙江路 1517 弄',
        }, {
          id: 3,
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
        }
      },
      handleInputConfirm(index, row) {
        console.log('blur');
//        this.selected.operation = '';
      },
      handleClickOutsideTable() {
        this.selected.operation = '';
      }
    }
  }
</script>