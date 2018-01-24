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
          message: '必须选择应用版本',
          trigger: 'blur'
        }, {
          required: true,
          message: '必须选择应用版本',
          trigger: 'change'
        }],
        acceptedUserIdList: [{
          type: 'array',
          required: true,
          message: '请选择验收人',
          trigger: 'blur'
        }, {
          validator(rule, values, callback) {
            let passed = values.length > 0;
            if (passed) {
              callback();
            }
          }
        }
        ],
        notifyUserIdList: [{
          type: 'array',
          required: true,
          message: '请选择知会人',
          trigger: 'blur'
        }, {
          validator(rule, values, callback) {
            let passed = values.length > 0;
            if (passed) {
              callback();
            }
          }
        }
        ],
        mailGroup: [{
          required: false,
        }
        ],
        comments: [{
          required: false,
          message: '请选择应用版本',
          trigger: 'blur'
        }],
      },
    }
  }

  getFeatureTypeList () {
    return [{
      id: 'DEMAND', name: '需求'
    }, {
      id: 'BUG', name: 'BUG'
    }]
  }

  getNameByStatus(status) {
    const statusMap = {
      'WORKORDER_APPLY': '工单申请',
      'WAIT_TEST': '等待测试',
      'TESTING': '测试受理中',
      'WAIT_DBA': '等待DBA处理',
      'DBAING': 'DBA受理中',
      'WAIT_DEPLOY': '等待部署',
      'DEPLOYING': '部署受理中',
      'WAIT_ACCEPTANCE': '等待验收',
      'ACCEPTANCEING': '验收受理中',
      'END': '结束',
    };
    if (status && statusMap.hasOwnProperty(status)) {
      return statusMap[status];
    } else {
      return null;
    }
  }

  getWorkOrderDetail(vueComponent, workOrder) {
    return new Promise((resolve, reject) => {
      let workOrderDetail = null;
      if (!workOrder.hasOwnProperty('id')) {
        reject(workOrderDetail);
      }
      vueComponent.$net.getWorkOrderDetail({
        id: workOrder.id
      }).then(result => {
        workOrderDetail = {
          name: workOrder.name,
          creatorName: workOrder.creatorName,
          groupId: null,
          groupName: workOrder.groupName,
          // featureList: [{
          //   name: '',
          //   type: WorkOrderPropUtils.getFeatureTypeList()[0]['id'],
          //   jiraAddress: null,
          //   description: null,
          //   valid: false
          // }],
          appID: null,
          appName: null,
          appVersion: '',
          acceptedUserIdList: [],
          notifyUserIdList: [],
          mailGroup: '',
          comment: '',
        };
        let groupInfo = vueComponent.$global.getGroupInfoByName(workOrder.groupName);
        if (groupInfo) {
          workOrderDetail.groupId = groupInfo['id'];
        }

        console.log(workOrder);
        if (result.hasOwnProperty('featureList') && Array.isArray(result.featureList)) {
          workOrderDetail.featureList = result.featureList.map(it => {
            return {
              name: it.functionName,
              type: it.functionType,
              jiraAddress: it.jiraAddress,
              description: it.description,
              valid: false,
            }
          })
        }
        if (result.hasOwnProperty('appList') && Array.isArray(result.appList)) {
          let app = result.appList[0];
          workOrderDetail.appID = app.appId;
          workOrderDetail.appName = app.appName;
          workOrderDetail.appVersion = app.appVersion;
        }
        if (result.hasOwnProperty('userToDo')) {
          workOrderDetail.userToDo = result.userToDo;
        }
        if (result.hasOwnProperty('userAcceptedList')) {
          workOrderDetail.acceptedUserIdList = result.userAcceptedList.map(it => {
            return it.id;
          })
        }
        if (result.hasOwnProperty('operationList')) {
          workOrderDetail.operationList = result.operationList;
        }
        if (result.hasOwnProperty('emailGroup')) {
          workOrderDetail.emailGroupList = result.emailGroup;
        }
        console.log(workOrderDetail);
        resolve(workOrderDetail);
      }).catch(err => {
        console.log(err);
        reject(workOrderDetail);
      });
    })
  }
}

export default new WorkOrderUtils();