<template>
  <div class="work-order-feature">
    <el-form :model="featureInfo" :rules="rules" size="mini"
             ref="featureForm" label-width="80px">
      <el-form-item label="功能名称" prop="name">
        <el-input v-model="featureInfo.name"></el-input>
      </el-form-item>
      <el-form-item label="功能类型" prop="type">
        <el-radio-group v-model="featureInfo.type">
          <el-radio label="gd">需求
          </el-radio>
          <el-radio label="gg">bug
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
        margin-bottom: 12px;
      }
    }
  }
</style>
<script>
  import workOrderUtils from '../../utils/work-order-props';
export default {
  created() {
  },
  mounted() {
  },
  props: {
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
  methods: {
    onPlugClick() {
      console.log(this.featureInfo);
      this.$refs['featureForm'].validate(valid => {
        console.log(valid);
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