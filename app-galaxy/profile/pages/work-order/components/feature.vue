<template>
  <div class="work-order-feature">
    <el-form :model="featureInfo" :rules="rules" size="mini"
             ref="featureForm" label-width="90px">
      <el-form-item label="功能名称" prop="name">
        <el-input v-model="featureInfo.name" placeholder="100字符内"></el-input>
      </el-form-item>
      <el-form-item label="功能类型" prop="type">
        <el-radio-group v-model="featureInfo.type">
          <el-radio v-for="(item, index) in featureTypeList()" :label="item.id" :key="index">
            {{item.name}}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="JIRA地址" prop="jiraAddress">
        <el-input v-model="featureInfo.jiraAddress"
                  type="textarea" :rows="2" placeholder="200字符内"></el-input>
      </el-form-item>
      <el-form-item label="功能描述" prop="description">
        <el-input v-model="featureInfo.description"
                  type="textarea" :rows="2" placeholder="200字符内"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="icon-section">
      <i class="el-icon-remove-outline" v-if="showRemove" @click="onIconClick('remove')"></i>
      <i class="el-icon-circle-plus-outline" v-if="showAdd" @click="onIconClick('add')"></i>
    </div>
  </div>
</template>

<style lang="scss">
  .work-order-feature {
    .el-form {
      .el-textarea {
        textarea {
          font-size: 12px;
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  .work-order-feature {
    position: relative;
    box-sizing: border-box;
    padding: 20px 28px 1px 8px;
    /*box-shadow: 0 0 8px 0 rgba(232, 237, 250, .6), 0 2px 4px 0 rgba(232, 237, 250, .5);*/
    /*box-shadow: 0 2px 2px 0 rgba(0,0,0,.16), 0 0 0 1px rgba(0,0,0,.08);*/
    border: 1px solid #cccccc;
    border-radius: 3px;
    margin-bottom: 8px;
    .icon-section {
      position: absolute;
      top: 3px;
      right: 3px;
      font-size: 24px;
      .el-icon-circle-plus-outline, .el-icon-remove-outline {
        display: block;
        color: #5a5e66;
        font-size: 20px;
        &:hover {
          color: black;
        }
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
  import workOrderUtils from '../utils/work-order-props';
export default {
  created() {
  },
  mounted() {
//    this.$nextTick(() => {
//      this.checkValidate();
//    });
  },
  props: {
    id: null,
    showAdd: {
      type: Boolean,
      default: true
    },
    showRemove: {
      type: Boolean,
      default: true
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
//    'featureInfo.name': {
//      immediate: true,
//      handler (value) {
//        this.checkValidate();
//      }
//    },
//    'featureInfo.type': {
//      immediate: true,
//      handler (value) {
//        this.checkValidate();
//      }
//    },
//    'featureInfo.jiraAddress': {
//      immediate: true,
//      handler (value) {
//        this.checkValidate();
//      }
//    },
  },
  methods: {
    featureTypeList() {
      return workOrderUtils.getFeatureTypeList();
    },
//    checkValidate() {
//      this.$refs.hasOwnProperty('featureForm') && this.$refs['featureForm'].validate(valid => {
//        this.featureInfo.valid = valid;
//      })
//    },
    validate() {
      return this.$refs['featureForm'].validate();
    },
    onIconClick(action) {
      switch (action) {
        case 'add':
          this.$refs['featureForm'].validate(valid => {
            if (valid) {
              this.$emit('add');
            }
          });
          break;
        case 'remove':
          this.$emit('remove', this.featureInfo);
          break;
      }
    }
  }

}
</script>