import utils from 'assets/libs/element-ui/utils';

class WorkOrderUtils {

  constructor() {
    let limit200 = utils.generateCountValidator(false, 0, 200);
    let limit200Required = utils.generateCountValidator(true, 0, 200);
    let limit100Required = utils.generateCountValidator(true, 0, 100);
    this.rules = {
      feature: {
        name: [{
          required: true,
          message: '请输入功能名称',
          trigger: ['blur', 'change']
        }, {
          validator: limit100Required
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
        }, {
          validator: limit200Required
        }],
        description: [{
          required: false,
          trigger: 'blur'
        }, {
          validator: limit200
        }]
      },
      workOrder: {
        name: [{
          required: true,
          message: '请输入工单名称',
          trigger: 'blur'
        }, {
          validator: limit100Required
        }],
        groupId: [{
          type: "number",
          required: true,
          message: '请选择团队',
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
        appIdList: [{
          type: 'array',
          required: true,
          message: '请选择应用名称',
          trigger: ['blur', 'change']
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
        }],
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
          }
        ],
        comment: [{
          required: false,
          trigger: 'blur'
        }, {
          validator: limit200
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

  getFeatureTypeList() {
    return [{
      id: 'DEMAND',
      name: '需求'
    }, {
      id: 'BUG',
      name: 'BUG'
    }]
  }

  getFeatureInfoByName(name) {
    let featureMap = {
      '需求': {
        id: 'DEMAND',
        name: '需求'
      },
      'BUG': {
        id: 'BUG',
        name: 'BUG'
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
      'HANDLEING': '处理中',
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

  getDefaultTestType() {
    return 'SKIP_TEST';
  }

  getAllTestType() {
    return [{
      label: '系统测试',
      value: 'SYSTEM_TEST'
    }, {
      label: '简版测试',
      value: 'SIMPLE_TEST'
    }, {
      label: '跳过测试',
      value: 'SKIP_TEST'
    }];
  }

  getTestTypeByValue(value) {
    let allTestList = this.getAllTestType();
    let target = null;
    allTestList.some(it => {
      target = it.value === value ? it : null;
      return target;
    });
    if (target) {
      return target.label;
    } else {
      return '未知';
    }
  }

  async getWorkOrderDetail(vueComponent, workOrderId) {
    const $net = vueComponent.$net;
    const $utils = vueComponent.$utils;
    const resContent = await $net.requestPaasServer($net.URL_LIST.work_order_detail, {
      params: {id: workOrderId}
    });
    // console.log(resContent);

    const workOrderDetail = {
      id: resContent['id'],
      name: resContent['name'],
      creatorName: resContent['creatorName'],
      groupId: resContent['groupId'],
      groupName: resContent['groupName'],
      // 功能列表
      featureList: [],
      // 应用列表
      appList: resContent['appVOList'],
      // 第一个应用的信息
      appID: resContent['appVOList'][0]['appId'], // to delete
      appName: resContent['appVOList'][0]['appName'], // to delete
      serviceVersion: resContent['appVOList'][0]['serviceVersion'], // to delete

      userToDo: resContent['todoUserNames'],
      // 验收人列表
      acceptedUserList: [],
      acceptedUserIdList: [],
      // 知会人列表
      notifyUserList: resContent['informUserList'],
      notifyUserIdList: resContent['informUserList'].map(it => {
        return it['userId'];
      }),
      // 邮件组列表
      mailGroupList: resContent['emailGroupList'].map(it => {
        return it.emailGroupName;
      }),
      // 操作记录
      operationList: [],
      // 测试报告列表
      testLogList: resContent['workOrderDeployTestReportList'].map(it => {
        return {
          path: it['testReportFilePath'],
          name: it['testReportFileName'],
          url: encodeURI($utils.formatUrl($net.URL_LIST.work_order_detail_download_test_log_get.path, {
            id: it.id
          })),
          id: it.id
        }
      }),

      // 工单状态
      status: resContent['status'],
      statusName: this.getNameByStatus(resContent['status']),
      // 测试类型
      testType: '',
      testTypeLabel: this.getTestTypeByValue(resContent['testType']),
      // 工单备注
      comment: resContent['remark'],
    };
    // 功能列表
    const featureNameMap = {
      'DEMAND': '需求',
      'BUG': 'BUG'
    };
    workOrderDetail['featureList'] = resContent['functionVOList'].map(it => {
      return {
        name: it.functionName,
        type: it.functionType,
        typeName: featureNameMap[it.functionType],
        jiraAddress: it.jiraAddress,
        description: it.description,
        valid: true,
      }
    });

    // 验收人列表
    const acceptedStatusMap = {
      NO_HANDLE: '未处理',
      REJECT: '拒绝处理',
      HANDLEING: '处理中',
      PASS: '通过'
    };
    workOrderDetail['acceptedUserList'] = resContent['acceptanceUserList'].map(it => {
      return {
        id: it.userId,
        userName: it.userName,
        status: acceptedStatusMap[it.status]
      }
    });
    workOrderDetail['acceptedUserIdList'] = workOrderDetail['acceptedUserList'].map(it => {
      return it['id'];
    });

    // 操作记录
    const operationMap = {
      'WORKORDER_APPLY': '工单申请',
      'WAIT_TEST': '等待测试',
      'TESTING': '测试受理中',
      'HANDLEING': '处理中',
      'WAIT_DBA': '等待DBA处理',
      'DBAING': 'DBA受理中',
      'WAIT_DEPLOY': '等待部署',
      'DEPLOYING': '部署受理中',
      'WAIT_ACCEPTANCE': '等待验收',
      'ACCEPTANCEING': '验收受理中',
      'END': '结束',
    };
    workOrderDetail['operationList'] = resContent['workOrderDeployLogList'].map(it => {
      return {
        createTime: $utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss'),
        handleUserName: it['handleUserName'],
        actionName: it['actionName'],
        remark: it['remark'],
      }
    });

    return workOrderDetail;
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
      vueComponent.$net.getWorkOrderDetail_1({
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
          comment: workOrder.comment ? workOrder.comment : '无备注',
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
        // 验收人
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

        if (result.hasOwnProperty('testType')) {
          workOrderDetail.testType = result['testType'];
          workOrderDetail.testTypeLabel = this.getTestTypeByValue(result['testType']);
        }
        if (result.hasOwnProperty('testLogList') && Array.isArray(result.testLogList)) {
          workOrderDetail.testLogList = result.testLogList.map(it => {
            return {
              path: it.testReportFilePath,
              name: it.testReportFileName,
              url: it.url,
              id: it.id
            }
          })
        } else {
          workOrderDetail.testLogList = [];
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