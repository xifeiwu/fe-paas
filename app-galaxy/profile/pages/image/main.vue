<template>
  <div id="image-main">
    <div class="header">
      <label>镜像仓库名称：</label>
      <el-input size="mini" style="max-width: 300px" v-model="repository" @keyup.enter.native="searchImage"></el-input>
      <el-button type="primary" @click="searchImage">搜索</el-button>
    </div>
    <div class="image-list">
      <el-table
        :data="imageList | pageSlice(pageNum,pageSize)"
        style="width: 90%;"
        stripe>
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
  import utils from 'assets/js/utils'
  export default {
    created(){
      this.getImage();
    },
    data(){
      return {
        imageList:[],
        repository:"",
        pageNum:1,
        pageSize:12,
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
      }
    },
    methods:{
      searchImage(){
        this.imageList = [];
        let options = {
          "groupTag":this.$storeHelper.groupInfo.tag,
          "repository":this.repository,
        };
        this.$net.searchImageRepository(options).then(data => {
          data.forEach(it => {
            it.creation_time = this.utils.formatDate(Date.parse(it.creation_time),"yyyy-MM-dd hh:mm:ss");
          });
          this.imageList = data;
          this.totalSize = this.imageList.length;
        })
      },
      getImage(){
        this.imageList = [];
        let options = {
          "groupTag":this.$storeHelper.groupInfo.tag,
        };
        this.$net.getImageRepository(options).then(data => {
          data.forEach(it => {
            it.creation_time = this.$utils.formatDate(Date.parse(it.creation_time),"yyyy-MM-dd hh:mm:ss");
          });
          this.imageList = data;
          this.totalSize = this.imageList.length;
        })
      },
      handleSizeChange(val){
        this.pageSize = val;
      },
      handleNumChange(val){
        this.pageNum = val;
      },
      goToDetail(row){
        const targetPath = this.$router.helper.getPathByRouterPath(this.$net.page['profile/image/detail'], {
          id: row.id
        });
        this.$router.push(targetPath);
      }
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