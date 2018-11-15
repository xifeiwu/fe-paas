<template>
  <div id="image-detail">
    <div class="header">
      <div class="back-page">
        <div class="paas-icon-back back-icon" @click="backLastPage"></div>
        <div class="back-image">{{repoName}}</div>
      </div>
      <label>版本：</label>
      <el-input size="mini" style="max-width: 300px" v-model="tag" @keyup.enter.native="getVersionList"></el-input>
      <el-button type="primary" @click="getVersionList">搜索</el-button>
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
          align="left">
        </el-table-column>
        <el-table-column
          prop="size"
          label="镜像大小"
          align="center"
          width="120px">
        </el-table-column>
        <el-table-column
          prop="created"
          label="构建成功时间"
          align="center"
          width="180px">
        </el-table-column>
        <el-table-column
          prop="gitAddress"
          label="git地址/分支"
          align="center">
          <template slot-scope="scope">
            {{gitAddressAndBranch(scope.row)}}
          </template>
        </el-table-column>
        <el-table-column
          prop="gitCommit"
          label="git commit"
          align="center">
        </el-table-column>
        <el-table-column
          prop="imageDescribe"
          label="描述"
          align="center">
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
      label{
        font-size: 16px;
        color:#232933;
      }
      .el-button{
        margin-left: 10px;
        margin-right: 33px;
      }
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
        repoName:'',
        tag:'',
        pageNum:1,
        pageSize:6,
        heightOfTable:'',
        resizeListener: () => {},
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
          resContent.forEach(it => {
            it.created = this.$utils.formatDate(Date.parse(it.created),"yyyy-MM-dd hh:mm:ss");
            it.size = parseInt(it.size / (1024 * 1024)) + "MB";
          });
          resContent.sort(function (a,b) {
            return Date.parse(new Date(b.created)) - Date.parse(new Date(a.created));
          });
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