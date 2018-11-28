<template>
  <div id="image-detail">
    <div class="header">
        <el-input size="mini" style="max-width: 300px" v-model="keyFilter" placeholder="搜索镜像" suffix-icon="el-icon-search"></el-input>
        <el-button size="mini-extral" type="primary" style="margin-left: 5px;"
                   @click="handleClick($event, 'refresh')"><i class="el-icon el-icon-refresh" style="margin-right: 3px;"></i>刷新</el-button>
    </div>
    <div class="version-list">
      <el-table
        :data="versionListByPage"
        stripe
        :height="heightOfTable">
        <el-table-column
          prop="imageName"
          label="镜像：版本"
          aheaderAlign="center" align="left"
          minWidth="150px"
        >
        </el-table-column>
        <el-table-column
          prop="size"
          label="镜像大小"
          headerAlign="center" align="center"
          width="100px">
        </el-table-column>
        <el-table-column
          prop="created"
          label="构建成功时间"
          headerAlign="center" align="center"
          width="160px">
        </el-table-column>
        <el-table-column
          prop="gitAddress"
          label="git地址/分支"
          headerAlign="center" align="center"
          minWidth="120px">
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
                prop="label"
                label="标签"
                headerAlign="center" align="center"
                minWidth="120px">
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
      }
    }
  }
</style>

<script>
  export default {
    created() {
      const queryString = window.location.search.replace(/^\?/, '');
      const queryObj = this.$utils.parseQueryString(queryString);
      this.repoName = queryObj.repoName;
    },
    mounted(){
      this.onScreenSizeChange(this.$storeHelper.screen.size);
      this.updateVersionListByPage();
    },
    beforeDestroy() {
    },
    data() {
      return {
        versionList: null,
        versionListFiltered: [],
        versionListByPage: [],
        keyFilter: '',

        repoName:'',

        totalSize: 0,
        currentPage: 1,
        pageSize: 12,

        heightOfTable:'',

        resizeListener: () => {},
      }
    },

    watch: {
      '$storeHelper.screen.size': 'onScreenSizeChange',
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
          this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
          this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 15 : 12;
        } catch(err) {
        }
      },

      async requestVersionList() {
        this.versionList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.image_detail_by_image_name,{
          payload: {
            'projectAndRepository':  this.repoName
          }
        });
//        console.log(resContent);

        const versionList = resContent.map(it => {
          it['create_time'] = new Date(it.created).getTime();
          it.created = this.$utils.formatDate(Date.parse(it.created),"yyyy-MM-dd hh:mm:ss");
          it.size = parseInt(it.size / (1024 * 1024)) + "MB";
          ['gitAddress', 'gitBranch', 'gitCommit', 'imageDescribe'].forEach(key => {
            if (!it[key]) {
              it[key] = '---';
            }
          });
          return it;
        }).sort((pre, next) => {
          return pre['create_time'] - next['create_time'];
        });
        this.versionList = resContent;
        this.totalSize = versionList.length;
        this.currentPage = 1;
      },

      async updateVersionListByPage(refresh) {
        if (refresh || !this.versionList) {
          await this.requestVersionList();
        }
        // update pageSize by screen size
        this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 15 : 12;
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
      },

      handleClick(evt, action) {
        switch (action) {
          case 'refresh':
            this.updateVersionListByPage(true);
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