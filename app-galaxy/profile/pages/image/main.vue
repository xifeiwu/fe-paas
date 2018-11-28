<template>
  <div id="image-main">
    <div class="header">
      <el-input size="mini" style="max-width: 300px" v-model="imageRepoFilter" placeholder="搜索镜像" suffix-icon="el-icon-search"></el-input>
      <el-button size="mini-extral" type="primary" style="margin-left: 5px;"
                 @click="handleClick($event, 'refresh')"><i class="el-icon el-icon-refresh" style="margin-right: 3px;"></i>刷新</el-button>
    </div>
    <div class="image-list">
      <el-table
        :data="imageRepoListByPage"
        style="width: 100%;"
        stripe
        :height="heightOfTable">
        <el-table-column
          prop="name"
          label="镜像仓库名称"
          align="left"
          minWidth="200px">
          <template slot-scope="scope">
            <span class="page-jump" @click="handleTRClick($event, 'page-jump', scope.$index, scope.row)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="tags_count"
          label="镜像数"
          align="center">
        </el-table-column>
        <el-table-column
          prop="creation_time"
          label="创建时间"
          align="center">
        </el-table-column>
        <!--<el-table-column-->
          <!--prop="creator"-->
          <!--label="创建人"-->
          <!--align="center"-->
          <!--width="220px">-->
        <!--</el-table-column>-->
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
  #image-main {
    height: 100%;
    .header{
      padding: 3px 5px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .image-list{
      text-align: center;
      .el-table{
        .page-jump {
          color: #409EFF;
          &:hover {
            font-weight: bold;
            cursor: pointer;
          }
        }
      }
    }
  }
</style>
<script>

  export default {
    created() {
    },
    mounted() {
      this.onScreenSizeChange(this.$storeHelper.screen.size);
      this.updateImageRepoListByPage(true);
    },
    beforeDestroy() {
    },
    data() {
      return {
        imageRepoList: [],
        imageRepoListFiltered: [],
        imageRepoListByPage: [],
        imageRepoFilter: "",

        totalSize: 0,
        pageSize: 12,
        currentPage: 1,

        heightOfTable:'',
      }
    },
    computed: {
    },
    watch: {
      '$storeHelper.groupInfo.id': function () {
        this.updateImageRepoListByPage(true);
      },

      '$storeHelper.screen.size': 'onScreenSizeChange',
      'imageRepoFilter': function () {
        this.updateImageRepoListByPage();
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


      async requestImageRepoList() {
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.image_repo_list_by_group, {
          payload: {
            groupTag: this.$storeHelper.groupInfo.tag
          }
        });
        const imageRepoList = resContent.body.map(it => {
          it['create_time'] = Date.parse(it.creation_time);
          it.creation_time = this.$utils.formatDate(it['create_time'], "yyyy-MM-dd hh:mm:ss");
          return it;
        }).sort(function (pre, next) {
          return pre['create_time'] - next['create_time'];
        });
        this.imageRepoList = imageRepoList;
        this.totalSize = parseInt(resContent.total);
        this.currentPage = 1;
      },

      async updateImageRepoListByPage(refresh) {
        if (refresh || !this.imageRepoList) {
          await this.requestImageRepoList();
        }
        // update pageSize by screen size
        this.pageSize = this.$storeHelper.screen['ratioHeight'] > 500 ? 15 : 12;
        var page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;

        this.imageRepoListFiltered = this.imageRepoList;
        if (this.imageRepoFilter) {
          const filterReg = new RegExp(this.imageRepoFilter);
          this.imageRepoListFiltered = this.imageRepoList.filter(it => {
            return filterReg.exec(it['name']);
          });
        }
        this.imageRepoListByPage = this.imageRepoListFiltered.slice(start, end);
      },

      handleClick(evt, action) {
        switch (action) {
          case 'refresh':
            this.updateImageRepoListByPage(true);
            break;
        }
      },
      handleTRClick(evt, action, index, row) {
        switch (action) {
          case 'page-jump':
            const targetPath = `${this.$net.page['profile/image/repo/version']}?repoName=${row.name}`;
            this.$router.push(targetPath);
            break;
        }
      },

      handlePaginationPageChange(page) {
        this.currentPage = page;
        this.updateImageRepoListByPage();
      },

      handleSizeChange(val){
        this.pageSize = val;
      },
    },
  }
</script>