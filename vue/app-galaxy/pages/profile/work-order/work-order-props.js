class WorkOrderUtils {
  constructor() {
    this.rules = {
      workOrderName: [{
        required: true,
        message: '请输入工单名称',
        trigger: 'blur'
      }],
      groupName: [{
        required: true,
        message: '请选择组名',
        trigger: 'blur'
      }],
      featureName: [{
        required: true,
        message: '请输入功能名称',
        trigger: 'blur'
      }],
    }
  }
}
export default new WorkOrderUtils();