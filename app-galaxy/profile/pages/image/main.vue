<template>
  <div id="image-main">
    <div class="header">
      <el-row type="flex" justify="center" align="middle">
        <el-col :span="6" :offset="17">
          <el-input size="mini" style="max-width: 300px" v-model="searchValue" placeholder="搜索镜像" suffix-icon="el-icon-search"></el-input>
        </el-col>
        <el-col :span="1" style="margin-right: 5px">
          <el-button size="mini-extral" type="primary" @click="getImage()"><i class="el-icon el-icon-refresh" style="margin-right: 3px;"></i>刷新</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="image-list">
      <el-table
        :data="imageList | pageSlice(pageNum,pageSize)"
        style="width: 100%;"
        stripe
        :height="heightOfTable">
        <el-table-column
          prop="name"
          label="镜像仓库名称"
          align="left"
          minWidth="200px">
          <template slot-scope="scope">
            <el-button type="text" @click="goToDetail(scope.row)">{{scope.row.name}}</el-button>
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
      <div class="pagination-container" v-if="imageList.length > pageSize">
        <div class="pagination">
          <el-pagination
            :current-page="pageNum"
            size="large"
            layout="prev,pager,next"
            :page-size="pageSize"
            :total="imageList.length"
            @size-change="handleSizeChange"
            @current-change="handleNumChange">
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
      padding: 4px 6px;
    }
    .image-list{
      text-align: center;
      .el-table{
        display: inline-block;
      }
    }
  }
</style>
<script>
  import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';

  export default {
    created() {
    },
    mounted() {
      const headerNode = this.$el.querySelector(':scope > .header');
      this.resizeListener = () => {
        let headerHeight = headerNode.offsetHeight;
        this.heightOfTable = this.$el.clientHeight - headerHeight;
      };
      this.resizeListener();
      addResizeListener(this.$el, this.resizeListener);
      this.getImage();
    },
    beforeDestroy() {
      removeResizeListener(this.$el, this.resizeListener);
    },
    data() {
      return {
        imageList:[],
        responseValue:[],
        searchValue:"",
        pageSize:12,
        pageNum:1,
        heightOfTable:'',
        resizeListener: () => {},
      }
    },
    computed: {
      groupTag(){
        return this.$storeHelper.groupInfo.tag;
      }
    },
    watch: {
      'groupTag':function () {
        this.getImage();
      },

      'searchValue':function (searchValue) {
        let filterReg = null;
        if(searchValue){
          filterReg = new RegExp(searchValue);
          let filterResult = [];
          this.responseValue.forEach(it => {
            let filterValue = filterReg.exec(it["name"]);
            if(filterValue){
              filterResult.push(it);
            }
          });
          this.imageList = filterResult;
          this.pageNum = 1;
          this.pageSize = 12;
        }else{
          this.imageList = this.responseValue;
        }
      }
    },
    methods: {
      getImage() {
        let payload = {};
        payload["groupTag"] = this.$storeHelper.groupInfo.tag;
        this.$net.requestPaasServer(this.$net.URL_LIST.image_list_by_group, {
          payload
        }).then(resContent => {
          resContent.body.forEach(it => {
            it.creation_time = this.$utils.formatDate(Date.parse(it.creation_time),"yyyy-MM-dd hh:mm:ss");
          });
          resContent.body.sort(function (a,b) {
            return Date.parse(new Date(b.creation_time)) - Date.parse(new Date(a.creation_time));
          });
          this.responseValue = resContent.body;
          this.imageList = resContent.body;
          this.pageNum = 1;
          this.pageSize = 12;
        });
      },

      goToDetail(row) {
        const targetPath = `${this.$net.page['profile/image/repo/version']}?repoName=${row.name}`;
        this.$router.push(targetPath);
      },

      handlePaginationPageChange(page) {
        this.currentPage = page;
        console.log(page);
        this.getImage();
      },

      handleSizeChange(val){
        this.pageSize = val;
      },

      handleNumChange(val){
        this.pageNum = val;
      },
    },

    filters:{
      pageSlice(array,pageNum,pageSize){
        let offset = (pageNum - 1) * pageSize;
        let data = (offset+pageSize >= array.length) ? array.slice(offset,array.length) : array.slice(offset,offset+pageSize);
        return data;
      }
    }
  }
</script>