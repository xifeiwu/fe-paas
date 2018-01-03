class WorkOrderUtils {
  constructor() {
    this.rules = {
      feature: {
        name: [{
          required: true,
          message: '请输入功能名称',
          trigger: 'blur'
        }],
        type: [{
          required: true,
          message: '请输入功能类型',
          trigger: 'blur'
        }],
        jiraAddress: [{
          required: true,
          message: '请输入jira地址',
          trigger: 'blur'
        }
        ]
      },
      workOrder: {
        name: [{
          required: true,
          message: '请输入工单名称',
          trigger: 'blur'
        }],
        groupName: [{
          required: true,
          message: '请选择组名',
          trigger: 'blur'
        }],
        appName: [{
          required: true,
          message: '请选择应用名称',
          trigger: 'blur'
        }],
        appVersion: [{
          required: true,
          message: '请选择应用版本',
          trigger: 'blur'
        }],
        acceptanceUser: [

        ],
        notifyUser: [

        ],
        mailGroup: [

        ],
        comments: [{
          required: false,
          message: '请选择应用版本',
          trigger: 'blur'
        }],
      },
    }
  }
}

export default new WorkOrderUtils();