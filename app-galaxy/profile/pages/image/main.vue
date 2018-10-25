<template>
  <div id="image-main">
    <div class="header">
      <label>镜像仓库名称：</label>
      <el-input size="mini" style="max-width: 300px" v-model="repository" @keyup.enter.native="getImage"></el-input>
      <el-button type="primary" @click="getImage">搜索</el-button>
    </div>
    <div class="image-list">
      <el-table
        :data="imageList"
        style="width: 90%;"
        stripe
        :height="heightOfTable">
        <el-table-column
          prop="name"
          label="镜像仓库名称"
          align="left">
          <template slot-scope="scope">
            <el-button type="text" @click="goToDetail(scope.row)">{{scope.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="tags_count"
          label="镜像数"
          align="center"
          width="330px">
        </el-table-column>
        <el-table-column
          prop="creation_time"
          label="创建时间"
          align="center"
          width="330px">
        </el-table-column>
        <!--<el-table-column-->
          <!--prop="creator"-->
          <!--label="创建人"-->
          <!--align="center"-->
          <!--width="220px">-->
        <!--</el-table-column>-->
      </el-table>
      <div class="pagination-container" v-if="totalNum > pageSize">
        <div class="pagination">
          <el-pagination
            :current-page="currentPage"
            size="large"
            layout="prev,pager,next"
            :page-size="pageSize"
            :total="totalNum"
            @current-change="handlePaginationPageChange">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  #image-main{
    .header{
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      margin-top: 20px;
      label{
        font-size: 16px;
        color:#232933;
      }
      .el-button{
        margin-left: 10px;
        margin-right: 65px;
      }
    }
    .image-list{
      text-align: center;
      margin-top: 30px;
      .el-table{
        display: inline-block;
      }
    }
  }
</style>
<script>
  export default {
    created(){
      this.getImage();
    },
    data(){
      return {
        imageList:[],
        repository:"",
        currentPage:1,
        pageSize:12,
        totalNum:0,
        heightOfTable:'',
      }
    },
    computed:{
      groupTag(){
        return this.$storeHelper.groupInfo.tag;
      }
    },
    watch:{
      'groupTag':function () {
        this.getImage();
      },
    },
    methods:{
      getImage(){
        this.imageList = [];
        let payload = {};
        payload["groupTag"] = this.$storeHelper.groupInfo.tag;
        if(this.repository != null && this.repository != ""){
          payload["repository"] = this.repository;
        }
        payload["page"] = this.currentPage;
        payload["pageSize"] = this.pageSize;
        this.$net.requestPaasServer(this.$net.URL_LIST.image_list_by_group, {
          payload
        }).then(resContent => {
          resContent.body.forEach(it => {
            it.creation_time = this.$utils.formatDate(Date.parse(it.creation_time),"yyyy-MM-dd hh:mm:ss");
          });
          this.imageList = resContent.body;
          this.totalNum = parseInt(resContent.total);
        });
      },

      goToDetail(row){
        const targetPath = `${this.$net.page['profile/image/repo/list']}?repoName=${row.name}`;
        this.$router.push(targetPath);
      },

      handlePaginationPageChange(page){
        this.currentPage = page;
        console.log(page);
        this.getImage();
      },

      onScreenSizeChange() {
        const headerNode = this.$el.querySelector(':scope > .header');
        const headerHeight = headerNode.offsetHeight;
        this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
      },
    },
  }
</script>