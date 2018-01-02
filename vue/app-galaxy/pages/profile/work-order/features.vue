<template>
  <div id="work-order-features">
    <el-form :model="featuresInfo" :rules="rules" size="mini"
             ref="basicForm" label-width="120px">
      <el-form-item label="功能名称：" prop="featureName">
        <el-input v-model="featuresInfo.featureName"></el-input>
      </el-form-item>
      <el-form-item prop="featureType">
        <el-radio-group v-model="featuresInfo.featureType">
          <el-radio :label="0">需求
          </el-radio>
          <el-radio :label="1">bug
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  import workOrderUtils from './work-order-props';
export default {
  props: {
    featuresInfo: Object
  },
  data() {
    return {
      rules: workOrderUtils.rules,
    }
  }
//  data() {
//    return {
//
//    }
//  }
}
</script>