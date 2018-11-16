<template>
  <div id="middleware-mariadb-add"
       v-loading="showLoading"
       :element-loading-text="loadingText">
    <div class="section-title">申请实例</div>
    <el-form :model="formData" :rules="formRules" size="mini"
             ref="createInstanceForm" label-width="140px">
      <el-form-item label="mariadb名称" prop="name" class="name">
      </el-form-item>
      <el-form-item label="mariadb版本" prop="version" class="name">
        <!--<el-radio-group v-model="createAppForm.language" @change="handleLanguageChange">-->
          <!--<el-radio v-for="item in language.list" :label="item.language" :key="item.id">-->
            <!--{{item.languageDesc}}-->
          <!--</el-radio>-->
          <!--&lt;!&ndash;<el-radio label="JAVA"></el-radio>&ndash;&gt;-->
          <!--&lt;!&ndash;<el-radio label="NODE_JS"></el-radio>&ndash;&gt;-->
          <!--&lt;!&ndash;<el-radio label="PHP"></el-radio>&ndash;&gt;-->
        <!--</el-radio-group>-->
      </el-form-item>
    </el-form>
    <div class="section-footer">
      <div class="item">
        <el-button type="primary" size="mini" @click="handleClick($event, 'submit')"
                   :loading="statusOfWaitingResponse('submit')">完成</el-button>
      </div>
      <div class="item">
        <el-button type="primary" size="mini" @click="$router.go(-1)">关闭</el-button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
#middleware-mariadb-add {
  background: white;
  margin: 10px;
  padding: 10px 30px;
  width: 80%;
  max-width: 750px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  .section-title {
    font-size: 18px;
    text-align: center;
    margin-bottom: 20px;
    font-weight: bold;
    .paas-icon-fa-question {
      font-size: 14px;
      color: #E6A23C;
      &:hover {
        cursor: pointer;
      }
    }
  }
  .section-footer {
    margin: 0px -10px;
    padding-top: 10px;
    border-top: 1px solid #e7e7e7;
    display: flex;
    .item {
      flex: 1;
      text-align: center;
    }
    .el-button {
      display: inline-block;
      width: 150px;
    }
  }
  .el-form {
    .el-form-item {
      .el-form-item__label {
        font-weight: bold;
      }
      &.group-list {
        .el-select {
          width: 240px;
        }
      }
      &.profiles {
        .el-checkbox + .el-checkbox {
          margin-left: 20px;
        }
      }
      &.build-type {
        .flex-layout {
          display: flex;
          align-items: flex-start;
          .war-name {
            padding-left: 10px;
            flex: 1;
            min-width: 100px;
            opacity: 1;
            transition: opacity .5s;
            &.hide {
              opacity: 0;
            }
          }
        }
      }
      &.finish {
        .el-button {
          display: block;
          margin: 0px auto;
          width: 50%;
          max-width: 200px;
          text-align: center;
        }
      }
      &.fileLocation {
        .add-file-location-btn {
          color: white;
          background-color: #409EFF;
          margin: 0px;
          width: 60px;
          padding: 7px 15px 8px 15px;
          border-width: 0px;
          border-radius: 0px;
          &:hover {
            background-color: #79bbff;
            font-weight: bold;
          }
        }
      }
      &.script-4-rolling-update {
      }
      &.max-age-4-script {
      }
    }
  }
}
</style>
<script>
  import commonUtils from 'assets/components/mixins/common-utils';
  module.exports = {
    mixins: [commonUtils],
    created() {

    },
    mounted() {

    },
    data() {
      return {
        showLoading: false,
        loadingText: '',
        formData: {
          name: '',
          version: ''
        },
        formRules: {

        }

      }
    },
    watch: {

    },
    methods: {
      handleClick(evt, action) {
        switch (action) {
          case 'submit':
            break;
        }
      }
    }
  }
</script>