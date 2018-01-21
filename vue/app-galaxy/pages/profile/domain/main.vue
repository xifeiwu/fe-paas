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
      </div>
    </div>
    <div class="domain-list">
      <el-table
              :data="currentDomainList"
              style="width: 100%"
      >
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
                    @click="handleRowButtonClick('delete', scope.$index, scope.row)">删除
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
          <!--<el-input v-model="fileLocationToAdd" placeholder="以/开头，可以包含字母数字下划线中划线，2-18位">-->
            <!--<template slot="append"><el-button class="add-file-location-btn" @click="handleAddFileLocation(fileLocationToAdd)">添加</el-button></template>-->
          <!--</el-input>-->
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
            <el-button action="profile-dialog/cancel"
                       @click="selected.operation = null">取&nbsp消</el-button>
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
      &.new-domain {
        max-width: 900px;
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
    }
  }

</style>

<script>
  import elVersionSelector from '../utils/components/version-selector.vue';
  import StoreHelper from '../utils/store-helper.vue';
  import ElInput from "../../../../packages/input/src/input";
  import ElSelect from "../../../../packages/select/src/select";
  import ElOption from "../../../../packages/select/src/option";
  export default {
    components: {ElOption, ElSelect, ElInput, elVersionSelector},
    mixins: [StoreHelper],
    created() {
    },
    data() {
      return {
        appList: [],

        currentDomainList: [{
          domain: 'www.finupgroup.com',
          createTime: '2017-06-06',
          creator: 'me',
          status: '生效中',
        }],

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
            }
          }]
        },
        waitingResponse: false,
      }
    },
    watch: {
    },
    methods: {
      handleButtonClick(action) {
        switch (action) {
          case 'new-domain':
            this.selected.operation = 'new-domain';
            console.log(this.selected);
            break;
        }
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
        }
      },
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
        }
      },

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
      }
    }
  }
</script>