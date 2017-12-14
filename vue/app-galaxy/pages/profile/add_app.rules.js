export default {
  groupID: [{
    required: true,
    message: '请选择所属用户组',
    trigger: 'change'
  }],
  appName: [{
    required: true,
    message: '请输入应用名称',
    trigger: 'blur'
  },
    {
      min: 3,
      max: 30,
      message: '长度在3到30个字符',
      trigger: 'blur'
    }, {
      pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9_-]+$/,
      message: '只能包含中文，字母，数字',
      trigger: 'blur'
    }
  ],
  projectName: [{
    required: true,
    message: '请输入项目名称',
    trigger: 'blur'
  }],
  profiles: [{
    type: 'array',
    required: true,
    message: '请选择至少一个运行环境',
    trigger: 'blur'
  }],
  language: [{
    required: true,
    message: '请选择开发语言',
    trigger: 'change'
  }],
  languageVersion: [{
    required: true,
    message: '请选择开发语言版本',
  }],
  buildType: [{
    required: true,
    message: '请选择构建类型',
    trigger: 'change'
  }],
  healthCheck: [{
    required: true,
    message: '请填写健康检查类型',
  }],
  gitlabAddress: [{
    required: true,
    message: '请填写gitlab地址',
  }],
  gitlabBranch: [{
    required: true,
    message: '请填写gitlab分支',
  }],
  relativePathOfParentPOM: [{
    required: false,
  }],
}
