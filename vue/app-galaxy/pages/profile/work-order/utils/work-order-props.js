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
        serviceVersion: [{
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
          required: false,
          message: '请选择知会人',
          trigger: 'blur'
        }, {
          validator(rule, values, callback) {
            callback();
          }
        }],
        mailGroupList: [{
          type: 'array',
          required: true,
          message: '请至少填写一个邮件组',
        },
          {
          validator(rule, values, callback) {
            let passed = true;
            let mailReg = /^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z]{2,6})$/;
            if (Array.isArray(values)) {
              values.every(it => {
                passed = mailReg.exec(it);
                if (!passed) {
                  callback(`${it}格式不正确`);
                }
                return passed;
              })
            } else {
              callback('不是数组');
            }
            if (passed) {
              callback();
            }
          }
        }],
        comments: [{
          required: false,
          message: '请选择应用版本',
          trigger: 'blur'
        }],
      },
    }
  }

  // 检测审批意见格式
  checkComment(comment) {
    let ok = true;
    if (comment) {
      let commentReg = /[\w\u4e00-\u9fa5]+/;
      if (!commentReg.exec(comment)) {
        ok = false;
      }
    }
    return ok;
  }

  getFeatureTypeList () {
    return [{
      id: 'DEMAND', name: '需求'
    }, {
      id: 'BUG', name: 'BUG'
    }]
  }

  getFeatureInfoByName (name) {
    let featureMap = {
      '需求': {
        id: 'DEMAND', name: '需求'
      },
      'BUG': {
        id: 'BUG', name: 'BUG'
      }
    };
    // set default featureInfo
    let featureInfo = featureMap['需求'];
    if (featureMap.hasOwnProperty(name)) {
      featureInfo = featureMap[name];
    }
    return featureInfo;
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

  /**
   * 通过工单基本信息获得工单详情
   * @param vueComponent
   * @param workOrder
   * @returns {Promise}
   */
  getWorkOrderDetailByBasic(vueComponent, workOrder) {
    return new Promise((resolve, reject) => {
      let workOrderDetail = null;
      if (!workOrder.hasOwnProperty('id')) {
        reject(workOrderDetail);
      }
      vueComponent.$net.getWorkOrderDetail({
        id: workOrder.id
      }).then(result => {
        // console.log(result);
        workOrderDetail = {
          id: workOrder.id,
          name: workOrder.name,
          creatorName: workOrder.creatorName,
          groupId: null,
          groupName: workOrder.groupName,
          featureList: [],
          appID: null,
          appName: null,
          serviceVersion: '',
          acceptedUserIdList: [],
          acceptedUserList: [],
          notifyUserIdList: [],
          notifyUserList: [],
          mailGroupList: [],
          comment: workOrder.remark,
          status: workOrder.status,
          statusName: workOrder.statusName
        };
        let groupInfo = vueComponent.$storeHelper.getGroupInfoByName(workOrder.groupName);
        if (groupInfo) {
          workOrderDetail.groupId = groupInfo['id'];
        }

        // get feature list
        if (result.hasOwnProperty('featureList') && Array.isArray(result.featureList)) {
          workOrderDetail.featureList = result.featureList.map(it => {
            return {
              name: it.functionName,
              type: this.getFeatureInfoByName(it.functionType).id,
              typeName: it.functionType,
              jiraAddress: it.jiraAddress,
              description: it.description,
              valid: true,
            }
          })
        }

        // get app. appList will be changed form object array to object
        if (result.hasOwnProperty('appList') && Array.isArray(result.appList)) {
          workOrderDetail.appList = result.appList;
          let app = result.appList[0];
          workOrderDetail.appID = app.appId;
          workOrderDetail.appName = app.appName;
          workOrderDetail.serviceVersion = app.serviceVersion;
        }
        if (result.hasOwnProperty('userToDo')) {
          workOrderDetail.userToDo = result.userToDo;
        }
        if (result.hasOwnProperty('userAcceptedList')) {
          workOrderDetail.acceptedUserList = result.userAcceptedList.map(it => {
            return {
              id: it.userId,
              userName: it.userName,
              status: it.status
            }
          });
          workOrderDetail.acceptedUserIdList = result.userAcceptedList.map(it => {
            return it.userId;
          });
        }
        if (result.hasOwnProperty('notifyUserList')) {
          workOrderDetail.notifyUserList = result.notifyUserList;
          workOrderDetail.notifyUserIdList = result.notifyUserList.map(it => {
            return it.userId;
          })
        }
        if (result.hasOwnProperty('operationList')) {
          workOrderDetail.operationList = result.operationList;
        }
        if (result.hasOwnProperty('emailGroup') && Array.isArray(result.emailGroup)) {
          workOrderDetail.mailGroupList = result.emailGroup.map(it => {
            return it.emailGroupName;
          })
        }
        // console.log(JSON.stringify(workOrder));
        // console.log(JSON.stringify(workOrderDetail));
        resolve(workOrderDetail);
      }).catch(err => {
        console.log(err);
        reject(workOrderDetail);
      });
    })
  }
}

export default new WorkOrderUtils();