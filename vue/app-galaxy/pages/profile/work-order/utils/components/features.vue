<template>
  <div class="work-order-feature">
    <el-form :model="featureInfo" :rules="rules" size="mini"
             ref="featureForm" label-width="80px">
      <el-form-item label="功能名称" prop="name">
        <el-input v-model="featureInfo.name"></el-input>
      </el-form-item>
      <el-form-item label="功能类型" prop="type">
        <el-radio-group v-model="featureInfo.type">
          <el-radio v-for="(item, index) in featureTypeList()" :label="item.id" :key="index">
            {{item.name}}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="JIRA地址" prop="jiraAddress">
        <el-input v-model="featureInfo.jiraAddress"></el-input>
      </el-form-item>
      <el-form-item label="功能描述" prop="description">
        <el-input v-model="featureInfo.description"
                  type="textarea"
                  :rows="2"
        ></el-input>
      </el-form-item>
    </el-form>
    <i class="el-icon-circle-plus-outline" v-if="showPlug" @click="onPlugClick"></i>
  </div>
</template>
<style lang="scss" scoped>
  .work-order-feature {
    position: relative;
    max-width: 350px;
    padding: 20px 28px 1px 8px;
    box-shadow: 0 0 8px 0 rgba(232, 237, 250, .6), 0 2px 4px 0 rgba(232, 237, 250, .5);
    .el-icon-circle-plus-outline {
      position: absolute;
      top: 2px;
      right: 3px;
      font-size: 24px;
      color: #5a5e66;
      &:hover {
        color: black;
        top: 1px;
        right: 1px;
        font-size: 26px;
      }
    }
    .el-form {
      .el-form-item--mini {
        margin-bottom: 16px;
      }
    }
  }
</style>
<script>
  import workOrderUtils from '../work-order-props';
  import ElRadio from "element-ui/packages/radio/src/radio";
export default {
  components: {ElRadio}, created() {
  },
  mounted() {
    this.checkValidate();
  },
  props: {
    id: null,
    showPlug: {
      type: Boolean,
      default: false
    },
    onPlug: Function,
    featureInfo: Object
  },
  data() {
    return {
      rules: workOrderUtils.rules.feature,
    }
  },
  watch: {
    'featureInfo.name': 'checkValidate',
    'featureInfo.type': 'checkValidate',
    'featureInfo.jiraAddress': 'checkValidate',
  },
  methods: {
    featureTypeList() {
      return workOrderUtils.getFeatureTypeList();
    },
    checkValidate() {
      this.$refs.hasOwnProperty('featureForm') && this.$refs['featureForm'].validate(valid => {
        console.log(valid);
        this.featureInfo.valid = valid;
      })
    },
    onPlugClick() {
//      console.log(this.featureInfo);
      this.$refs['featureForm'].validate(valid => {
        if (valid) {
          this.onPlug();
        }
      })
    }
  }

//  data() {
//    return {
//
//    }
//  }
}
</script>