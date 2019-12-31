<template>
  <div id="image-detail">
    <div class="header">
        <el-input size="mini" style="max-width: 300px" v-model="keyFilter" placeholder="搜索镜像" suffix-icon="el-icon-search"></el-input>
        <el-button size="mini" type="primary" style="margin-left: 5px;"
                   @click="handleClick($event, 'refresh')"><i class="el-icon el-icon-refresh" style="margin-right: 3px;"></i>刷新</el-button>
    </div>
    <div class="version-list">
      <el-table
        :data="versionListByPage"
        stripe
        :height="heightOfTable">
        <el-table-column
          prop="imageName"
          label="镜像:版本"
          aheaderAlign="center" align="left"
          minWidth="180px"
        >
        </el-table-column>
        <el-table-column
          prop="size"
          label="镜像大小"
          headerAlign="center" align="center"
          width="80px">
        </el-table-column>
        <el-table-column
          label="构建成功时间"
          headerAlign="center" align="center"
          width="100px">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedCreateTime)">
              <div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedCreateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="gitAddress"
          label="git地址/分支"
          headerAlign="center" align="center"
          minWidth="160px">
          <template slot-scope="scope">
            {{gitAddressAndBranch(scope.row)}}
          </template>
        </el-table-column>
        <el-table-column
          prop="gitCommit"
          label="git commit"
          headerAlign="center" align="center"
          minWidth="120px">
        </el-table-column>
        <el-table-column
          prop="imageDescribe"
          label="描述"
          headerAlign="center" align="center"
          minWidth="120px">
        </el-table-column>
        <el-table-column
                prop="survivalDays"
                label="剩余天数"
                headerAlign="center" align="center"
                width="80px">
        </el-table-column>
        <el-table-column
                label="废弃标签"
                headerAlign="center" align="center"
                width="80px">
          <template slot-scope="scope">
            <div class="labels">
              <el-tag v-for="(label, index) in scope.row.labels" :key="index" size="small" :disableTransitions="false" closable
                      @close="handleTRClick($event, 'remove-label', scope.row, label)">{{label.description}}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" headerAlign="center" align="center" minWidth="80" class="operation-list">
          <template slot-scope="scope">
            <div>
              <el-button
                      v-if="scope.row.canDeleted"
                      size="small"
                      type="text"
                      :class="['danger', 'flex']"
                      @click="handleTRClick($event,'image_remove', scope.row, scope.$index)">
                <span>删除</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="totalSize > pageSize">
        <div class="pagination">
          <el-pagination
                  :current-page="currentPage"
                  size="large"
                  layout="prev,pager,next"
                  :page-size="pageSize"
                  :total="totalSize"
                  @current-change="handlePaginationPageChange">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  #image-detail{
    height: 100%;
    .header{
      padding: 3px 5px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    .version-list{
      text-align: center;
      .el-table{
        display: inline-block;
        .labels {
          .el-tag {
            margin: 1px 2px;
            display: inline-block;
          }
        }
      }
    }
  }
</style>

<script>
  export default {
    created() {
      const queryString = window.location.search.replace(/^\?/, '');
      const {repoName} = this.$utils.parseQueryString(queryString);
      if (!repoName) {
        this.$router.push({
          name: 'image_list'
        });
        return;
      }
      this.query.repoName = repoName;
      this.updateVersionListByPage();
    },
    mounted() {
      this.onScreenSizeChange(this.$storeHelper.screen.size);
    },
    beforeDestroy() {
    },
    data() {
      return {
        versionList: null,
        versionListFiltered: [],
        versionListByPage: [],
        keyFilter: '',

        query: {
          repoName: ''
        },

        totalSize: 0,
        currentPage: 1,
        pageSize: 12,

        heightOfTable:'',

        resizeListener: () => {},
      }
    },

    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
      'pageSize': 'updateVersionListByPage',
      'keyFilter': function () {
        this.updateVersionListByPage();
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
          this.heightOfTable = this.$el.clientHeight - headerHeight;
          this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 12 : 10;
        } catch(err) {
        }
      },

      async requestVersionList() {
        this.versionList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.image_version_list_by_repo,{
          payload: {
            'projectAndRepository':  this.query.repoName
          }
        });
//        console.log(resContent);

        const versionList = resContent.map(it => {
          it['create_time'] = new Date(it.created).getTime();
          it.created = this.$utils.formatDate(Date.parse(it.created),"yyyy-MM-dd hh:mm:ss");
          it.size = parseInt(it.size / (1024 * 1024)) + "MB";
          ['gitAddress', 'gitBranch', 'gitCommit', 'imageDescribe', 'survivalDays'].forEach(key => {
            if (!it[key]) {
              it[key] = '---';
            }
          });
          return it;
        }).sort((pre, next) => {
          return (pre['create_time'] - next['create_time']) * -1;
        });
        this.versionList = versionList;
        this.totalSize = versionList.length;
        this.currentPage = 1;
      },

      /**
       * 更新分页列表：versionListByPage
       * @param refresh, 是否更新列表
       * @returns {Promise.<void>}
       */
      async updateVersionListByPage(refresh) {
        if (refresh || !this.versionList) {
          await this.requestVersionList();
        }
        var page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;

        this.versionListFiltered = this.versionList;
        if (this.keyFilter) {
          const filterReg = new RegExp(this.keyFilter);
          this.versionListFiltered = this.versionList.filter(it => {
            return filterReg.exec(it['imageName']);
          });
        }
        this.totalSize = this.versionListFiltered.length;
        this.versionListByPage = this.versionListFiltered.slice(start, end);
        this.versionListByPage.forEach(it => {
          it['formattedCreateTime'] = this.$utils.formatDate(it['created'], 'yyyy-MM-dd hh:mm:ss').split(' ');
        })
      },

      handleClick(evt, action) {
        switch (action) {
          case 'refresh':
            this.updateVersionListByPage(true);
            break;
        }
      },
      async handleTRClick(evt, action, row, index) {
        switch (action) {
          case 'image_remove':
            try {
              await this.$confirm(`确定要删除镜像${row.imageName}？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              this.$net.requestPaasServer(this.$net.URL_LIST.image_remove, {
                data: {
                  fullName: row.imageName
                }
              });
              this.$message.success('删除成功');
              console.log(arguments);
            } catch (err) {
              console.log(err);
            }
            break;
          case 'remove-label':
            const label = index;
            try {
              const warningMsg = `确定要移除镜像 “${row.imageName}” 的标签 "${label.description}" 吗？`;
              await this.$confirm(warningMsg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
              });
              const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.image_version_remove_label, {
                payload: {
                  fullName: row['imageName'],
                  labelName: label['name']
                }
              });
              // refresh label list
              const index = row.labels.indexOf(label);
              if (index > -1) {
                row.labels.splice(index, 1);
              }
              this.$message.success('标签删除成功！');
            } catch (err) {

            }
            break;
        }
      },

      handlePaginationPageChange(val){
        this.currentPage = val;
        this.updateVersionListByPage();
      },

      gitAddressAndBranch(row){
        if(row.gitAddress == "" && row.gitBranch == ""){
          return "";
        }else{
          return row.gitAddress + "/" + row.gitBranch;
        }
      }
    },
  }
</script>