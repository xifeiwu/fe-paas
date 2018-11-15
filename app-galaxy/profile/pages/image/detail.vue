<template>
  <div id="image-detail">
    <div class="header">
      <div class="back-page">
        <div class="paas-icon-back back-icon" @click="backLastPage"></div>
        <div class="back-image">{{repoName}}</div>
      </div>
      <el-input size="mini" style="max-width: 300px" v-model="searchValue" placeholder="搜索镜像" suffix-icon="el-icon-search"></el-input>
    </div>
    <div class="version-list">
      <el-table
        :data="versionList | pageSlice(pageNum,pageSize)"
        style="width: 95%"
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
          width="120px">
        </el-table-column>
        <el-table-column
          prop="created"
          label="构建成功时间"
          headerAlign="center" align="center"
          width="180px">
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
      </el-table>
      <div class="pagination-container" v-if="versionList.length > pageSize">
        <div class="pagination">
          <el-pagination
                  :current-page="pageNum"
                  size="large"
                  layout="prev,pager,next"
                  :page-size="pageSize"
                  :total="versionList.length"
                  @size-change="handleSizeChange"
                  @current-change="handleNumChange">
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
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      padding-top: 20px;
      margin-right: 33px;
      .back-page{
        position: absolute;
        left:45px;
        top: 10px;
        .back-icon{
          cursor: pointer;
          &:hover{color:blue;}
          font-size:25px;
        }
      }
    }
    .version-list{
      text-align: center;
      margin-top: 30px;
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
      const queryString = window.location.search.replace(/^\?/, '');
      const queryObj = this.$utils.parseQueryString(queryString);
      this.repoName = queryObj.repoName;
      this.getVersionList();
    },
    mounted(){
      const headerNode = this.$el.querySelector(':scope > .header');
      this.resizeListener = () => {
        let headerHeight = headerNode.offsetHeight;
        this.heightOfTable = this.$el.clientHeight - headerHeight - 18;
      };
      this.resizeListener();
      addResizeListener(this.$el, this.resizeListener);
    },
    beforeDestroy() {
      removeResizeListener(this.$el, this.resizeListener);
    },
    data() {
      return {
        versionList:[],
        responseValue:[],
        searchValue:'',
        repoName:'',
        tag:'',
        pageNum:1,
        pageSize:6,
        heightOfTable:'',
        resizeListener: () => {},
      }
    },

    watch: {
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
          this.versionList = filterResult;
        }else{
          this.versionList = this.responseValue;
        }
      }
    },

    methods: {
      getVersionList() {
        this.versionList = [];
        let payload = {};
        payload["projectAndRepository"] = this.repoName;
        if(this.tag != null && this.tag != ""){
          payload["tag"] = this.tag;
        }
        this.$net.requestPaasServer(this.$net.URL_LIST.image_detail_by_image_name,{
          payload
        }).then(resContent => {
          resContent.sort(function(a, b) {
            return Date.parse(new Date(b.created)) - Date.parse(new Date(a.created));
          }).forEach(it => {
            it.created = this.$utils.formatDate(Date.parse(it.created),"yyyy-MM-dd hh:mm:ss");
            it.size = parseInt(it.size / (1024 * 1024)) + "MB";
            ['gitAddress', 'gitBranch', 'gitCommit', 'imageDescribe'].forEach(key => {
              if (!it[key]) {
                it[key] = '---';
              }
            })
          });
          this.responseValue = resContent;
          this.versionList = resContent;
        })
      },

      backLastPage(){
        this.$router.go(-1);
      },

      handleSizeChange(val){
        this.pageSize = val;
      },

      handleNumChange(val){
        this.pageNum = val;
      },

      gitAddressAndBranch(row){
        if(row.gitAddress == "" && row.gitBranch == ""){
          return "";
        }else{
          return row.gitAddress + "/" + row.gitBranch;
        }
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