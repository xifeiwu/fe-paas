<template>
  <div id="service-list">
    <div class="header">
      <el-tabs type="border-tab" v-model="profileName">
        <el-tab-pane v-for="item in $storeHelper.profileListOfGroup" :label="item.description" :name="item.name"
                     :key="item.id"></el-tab-pane>
      </el-tabs>
      <div class="operation">
        <el-button
                v-if="false"
                size="mini"
                type="primary"
                @click="handleButtonClick($event, 'service_create')"
                :class="['flex', $storeHelper.permission['service_create'].disabled || this.appIdWithoutService.length === 0 ? 'disabled' : '']">
          <span>创建服务</span><i class="paas-icon-level-up"></i>
        </el-button>
        <el-button size="mini"
                   type="primary"
                   @click="handleButtonClick($event, 'refresh-list')">
          <span>刷新列表</span><i class="el-icon el-icon-refresh" style="margin-left: 3px;"></i>
        </el-button>
        <el-input
                size="mini"
                style="max-width: 300px"
                placeholder="按关键字搜索服务"
                v-model="filterKey">
          <i :class="filterKey && filterKey.length > 0 ? 'paas-icon-close' : 'el-icon-search'"
             slot="suffix" style="line-height: 26px;"
             @click="evt => evt.target.classList.contains('paas-icon-close') ? filterKey = '' : ''"></i>
        </el-input>
      </div>
    </div>
    <div class="list">
      <el-table :data="serviceListByPage"
                stripe
                :height="heightOfTable">
        <el-table-column label="语言版本" headerAlign="center" align="center" width="80">
          <template slot-scope="scope">
            <svg :class="['paas-icon-svg', 'paas-icon-' + scope.row.language.name]" aria-hidden="true" v-if="scope.row.language.name">
              <use :xlink:href="'#paas-icon-' + scope.row.language.name"></use>
            </svg>
            <div class="language" v-else>{{scope.row.language.name ? scope.row.language.name : '语言名未知'}}</div>
            <div class="version" v-if="">{{scope.row.language.version ? scope.row.language.version : '版本未知'}}</div>
          </template>
        </el-table-column>
        <el-table-column label="应用名称" headerAlign="left" align="left" minWidth="100">
          <template slot-scope="scope">
            <span class="link" @click="handleTRClick($event, 'go_to_page_app_list', scope.$index, scope.row)">{{scope.row.appName}}</span>
            <span v-if="$storeHelper.groupVersion === 'v1'"
                  style="display: inline; color: #909399; font-size: 12px; line-height: 14px; cursor: pointer; padding: 1px; border: 1px solid #909399; border-radius: 4px; word-break: normal"
                  @mouseenter="handleTRClick($event, 'k8s-tag', scope.$index, scope.row)"
            >{{scope.row.k8s === 1 ? 'k8s':'mesos'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目名称" prop="tag" headerAlign="left" align="left" minWidth="100"></el-table-column>
        <el-table-column label="内网域名" headerAlign="left" align="left" minWidth="100">
          <template slot-scope="scope">
            <span class="link" @click="handleTRClick($event, 'go_to_intranet_domain', scope.$index, scope.row)">{{scope.row.intranetDomain}}</span>
            <i class="paas-icon-copy"
               v-clipboard:copy="scope.row.intranetDomain"
               v-clipboard:success="handleSuccessCopy"></i>
          </template>
        </el-table-column>
        <el-table-column
                prop="applicationServiceStatus"
                label="运行实例数/总实例数"
                width="160"
                headerAlign="center" align="center"
        >
          <template slot-scope="scope">
            {{scope.row.k8s === 1 ? scope.row.instanceCount : '---' }}
          </template>
        </el-table-column>
        <el-table-column v-if="!isProductionProfile" label="过期时间(天)" headerAlign="center" align="center" width="100">
          <template slot-scope="scope">
            {{scope.row.remainExpiredDays < 0 ? 0 : scope.row.remainExpiredDays}}
          </template>
        </el-table-column>
        <el-table-column label="创建日期" prop="formattedCreateTime" headerAlign="center" align="center" width="100">
          <template slot-scope="scope">
            <div v-if="Array.isArray(scope.row.formattedCreateTime)">
              <div v-for="(item, index) in scope.row.formattedCreateTime" :key="index">
                {{item}}
              </div>
            </div>
            <div v-else>{{scope.row.formattedCreateTime}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" headerAlign="left" align="left" minWidth="180">
          <template slot-scope="scope">
            <div v-if="scope.row.id" style="line-height: 20px;">
              <el-button
                      v-if="!isProductionProfile"
                      size="small"
                      type="text"
                      :loading="statusOfWaitingResponse('service_deploy') && action.row.appId == scope.row.appId"
                      @click="handleTRClick($event, 'service_deploy', scope.$index, scope.row)"
                      :class="$storeHelper.permission['service_deploy'].disabled || publishStatus? 'disabled' : 'danger'">
                    {{statusOfWaitingResponse('deploy') && action.row.appId == scope.row.appId ? '部署中': '部署'}}
              </el-button>
              <div v-if="!isProductionProfile"
                   class="ant-divider"></div>
              <el-button
                      size="small"
                      type="text"
                      :loading="statusOfWaitingResponse('quick_deploy') && action.row.appId == scope.row.appId"
                      @click="handleTRClick($event, 'quick_deploy', scope.$index, scope.row)"
                      :class="reason4DisableQuickDeploy(scope.row) || publishStatus? 'disabled' : 'danger'">
                    {{statusOfWaitingResponse('quick_deploy') && action.row.appId == scope.row.appId ? '重启中': '重启'}}
              </el-button>
              <div class="ant-divider"></div>
              <el-button
                      v-if="isProductionProfile"
                      size="small"
                      type="text"
                      :loading="statusOfWaitingResponse('image_rollback') && action.row.appId == scope.row.appId"
                      @click="handleTRClick($event, 'image_rollback', scope.$index, scope.row)"
                      :class="$storeHelper.permission['image_rollback'].disabled || publishStatus? 'disabled' : 'danger'">
                {{'回滚'}}
              </el-button>
              <div class="ant-divider"
                   v-if="isProductionProfile"></div>
              <el-button
                      size="small"
                      type="text"
                      :loading="statusOfWaitingResponse('service_stop') && action.row.appId == scope.row.appId"
                      @click="handleTRClick($event, 'service_stop', scope.$index, scope.row)"
                      :class="$storeHelper.permission['service_stop'].disabled || scope.row.containerStatus.Total == 0 || publishStatus? 'disabled' : 'danger'">
                停止
              </el-button>
              <div class="ant-divider"></div>
              <el-button
                      size="small"
                      type="text"
                      :loading="statusOfWaitingResponse('service_delete') && action.row.appId == scope.row.appId"
                      @click="handleTRClick($event, 'service_delete', scope.$index, scope.row)"
                      :class="$storeHelper.permission['service_delete'].disabled || publishStatus? 'disabled' : 'danger'">
                删除
              </el-button>
              <div class="ant-divider"></div>
              <el-button
                      type="text"
                      :class="['flex', $storeHelper.permission['service_update'].disabled || publishStatus ? 'disabled' : 'primary']"
                      @click="handleTRClick($event, 'service_update', scope.$index, scope.row)">
                <span>修改配置</span><i class="paas-icon-level-up"></i>
              </el-button>
              <div class="ant-divider"></div>
              <el-button
                      size="small"
                      type="text"
                      :class="['flex', 'primary']"
                      @click="handleTRClick($event, 'go-to-page-service-detail-from-page-service', scope.$index, scope.row)">
                <span>服务详情</span><i class="paas-icon-level-up"></i>
              </el-button>
              <div class="ant-divider"></div>
              <el-button
                      v-if="isProductionProfile"
                      size="small"
                      type="text"
                      :class="['primary']"
                      @click="handleTRClick($event,'go-to-work-order-todo-add', scope.$index, scope.row)">
                <span>申请工单</span><i class="paas-icon-level-up"></i>
              </el-button>
              <div v-if="isProductionProfile" class="ant-divider"></div>
              <el-button
                      size="small"
                      type="text"
                      :class="['flex', 'primary']"
                      @click="handleTRClick($event, 'go-to-page-log-deploy-from-service', scope.$index, scope.row)">
                <span>部署日志</span><i class="paas-icon-level-up"></i>
              </el-button>
              <div class="ant-divider"></div>
              <el-button
                      size="small"
                      type="text"
                      :class="['flex', 'primary']"
                      @click="handleTRClick($event, 'go-to-instance-list', scope.$index, scope.row)">
                <span>实例列表</span><i class="paas-icon-level-up"></i>
              </el-button>
              <div class="ant-divider"></div>
              <el-button
                      v-if="$storeHelper.groupVersion === 'v2'"
                      size="small"
                      type="text"
                      @click="handleTRClick($event, 'go-page-domain-from-service', scope.$index, scope.row)"
                      :class="$storeHelper.permission['go-page-domain-from-service'].disabled ? 'disabled' : 'primary'">
                <span>配置外网二级域名</span><i class="paas-icon-level-up"></i>
              </el-button>
              <div class="ant-divider" v-if="$storeHelper.groupVersion === 'v2'"></div>
              <el-button
                      v-if="false"
                      size="small"
                      type="text"
                      @click="handleTRClick($event, 'v1-add-internetDomain', scope.$index, scope.row)"
                      :class="['primary']">
                <span>添加外网域名</span><i class="paas-icon-level-up"></i>
              </el-button>
              <div class="ant-divider" v-if="false"></div>
              <el-button
                      size="small"
                      type="text"
                      @click="handleTRClick($event, 'service_config_copy', scope.$index, scope.row)"
                      :class="[$storeHelper.permission['copy-service'].disabled || publishStatus? 'disabled' : '', 'flex']">
                <span>复制服务</span><i class="paas-icon-level-up"></i>
              </el-button>
              <div class="ant-divider" v-if="!$storeHelper.permission['get_affinity'].disabled"></div>
              <el-button v-if="!$storeHelper.permission['get_affinity'].disabled"
                  size="small"
                  type="text"
                  @click="handleTRClick($event, 'update_affinity', scope.$index, scope.row)"
                  :class="reason4DisableQuickDeploy(scope.row) || publishStatus? 'disabled' : 'danger'">
                <span>亲和性配置</span><i class="paas-icon-level-up"></i>
              </el-button>
              <div class="ant-divider" v-if="!$storeHelper.permission['get_affinity'].disabled"></div>
              <el-button v-if="!$storeHelper.permission['get_affinity'].disabled"
                         size="small"
                         type="text"
                         @click="handleTRClick($event, 'show_info_with_k8s', scope.$index, scope.row)"
                         :class="['primary']">
                <span>K8S实时信息展示</span><i class="paas-icon-level-up"></i>
              </el-button>
            </div>
            <el-button
                    v-else
                    size="small"
                    type="text"
                    :loading="statusOfWaitingResponse('service_config_add') && action.row.appId == scope.row.appId"
                    :class="[$storeHelper.permission['service_create'].disabled || publishStatus? 'disabled' : 'warning','flex']"
                    @click="handleTRClick($event, 'service_config_add', scope.$index, scope.row)">
              <span>创建服务</span><i class="paas-icon-level-up"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="totalSize > pageSize">
        <div class="pagination">
          <el-pagination
                  :current-page="currentPage"
                  size="large"
                  layout="prev, pager, next"
                  :page-size = "pageSize"
                  :total="totalSize"
                  @current-change="page => {currentPage = page}"
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <!--为v1团队添加外网域名-->
    <el-dialog title="添加外网域名" :visible="action.name == 'v1-add-internetDomain'"
               :close-on-click-modal="false"
               class="internet-domain size-700"
               @close="action.name = null"
               v-if="action.name && action.row"
    >
      <el-tag type="warning" disable-transitions>
        <i class="el-icon-warning"></i>
        <span>老团队只支持添加一个外网域名（如想自助式配置外网域名和IP白名单，请联系Paas团队，进行应用迁移）</span>
      </el-tag>
      <el-form size="mini" label-width="120px" ref="changeInternetDomainForm">
        <el-form-item label="将要添加的域名" :error="props4CreateDomain.errMsgForDomainList">
          <div v-if="props4CreateDomain.domainToAdd.length > 0">
            <el-tag class="domain-to-add"
                    v-for="(item, index) in props4CreateDomain.domainToAdd"
                    :key="index"
                    closable
                    type="success"
                    size="small"
                    @close="handleDomainInDialog($event, 'remove', item)"
            >{{item}}</el-tag>
          </div>
          <div v-else>无</div>
        </el-form-item>
        <el-form-item label="外网二级域名" :error="props4CreateDomain.errMsgForDomainName">
          <el-input v-model="props4CreateDomain.prefixName" placeholder="小写字符、数字、中划线，以字符数字开头，长度不超过63位"
                    style="margin-bottom: 3px;"></el-input>
          <el-select v-model="props4CreateDomain.subDomain"
                     :placeholder="(props4CreateDomain.subDomainList && props4CreateDomain.subDomainList.length > 0) ? '请选择':'无数据'">
            <el-option v-for="(item, index) in props4CreateDomain.subDomainList" :value="item.domainName" :label="item.domainName"
                       :key="index"></el-option>
          </el-select>
          <el-button :class="['add-domain-btn', props4CreateDomain.domainToAdd.length > 0 ? 'disabled': '']"
                     size="mini-extral" type="primary" @click="handleDomainInDialog($event, 'add')">添加</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex">
        <div class="item">
          <el-button type="primary"
                     @click="v1UpdateInternetDomain"
                     :loading="waitingResponse">保&nbsp存</el-button>
        </div>
        <div class="item">
          <el-button action="profile-dialog/cancel"
                     @click="action.name = null">取&nbsp消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="部署服务" :visible="actionNew.name == 'service_deploy'"
               v-if="actionNew.name && actionNew.name == 'service_deploy'"
               class="confirm-dialog size-600"
               :close-on-click-modal="false"
               @close="closeDialog"
    >
      <div class="el-message-box__status el-icon-warning" style="padding-bottom: 27px;"></div>
      <div class="el-message-box__message">
        <p>您确认要部署{{actionNew.data.serviceDesc}}吗?</p>
        <el-checkbox v-model="actionNew.data.forceClone">强制清空打包目录（删除所有源代码、包文件等）</el-checkbox>
      </div>

      <span slot="footer" class="el-message-box__btns">
        <el-button @click="closeDialog">取&nbsp消</el-button>
        <el-button type="primary"
                   @click="handleDialogEvent($event, actionNew.name)"
                   :loading="waitingResponse">确&nbsp认</el-button>
      </span>
    </el-dialog>

    <el-dialog title="亲和性配置错误信息" :visible.sync="affinityEditError"
               v-if="affinityEditError"
               class="confirm-dialog size-1000"
               :close-on-click-modal="false"
               @close="closeDialog"
    >
      <div class="el-message-box__message">
        <el-scrollbar style="height: 500px; margin: 0px -5px;">
          <div>{{affinityDescribeError}}}</div>
        </el-scrollbar>
      </div>

      <span slot="footer" class="el-message-box__btns">
        <el-button type="primary" @click="affinityEditError = false">确&nbsp认</el-button>
      </span>
    </el-dialog>

    <!--not used-->
    <el-dialog :title="actionNew.data.title" :visible="['quick_deploy', 'service_stop', 'service_delete'].indexOf(actionNew.name) > -1"
               v-if="actionNew.name && false"
               class="confirm-dialog size-700"
               :close-on-click-modal="false"
               @close="closeDialog"
    >
      <div class="content">
        <i class="el-icon-warning left"></i>
        <div class="right">
          <div v-html="actionNew.data.tip"></div>
          <el-input v-model="actionNew.data.confirm"></el-input>
        </div>
      </div>
      <span slot="footer" class="el-message-box__btns">
        <el-button @click="closeDialog">取&nbsp消</el-button>
        <el-button type="primary"
                   @click="handleDialogEvent($event, actionNew.name)"
                   :loading="waitingResponse">确&nbsp认</el-button>
      </span>
    </el-dialog>


    <el-dialog title="镜像回滚" :visible="actionNew.name == 'image_rollback'"
               v-if="actionNew.name"
               class="image_rollback"
               :close-on-click-modal="false"
               @close="closeDialog"
               top="80px"
    >
      <div class="assist">
        <i class="paas-icon-fa-home"></i>
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item v-for="(item, index) in rollingUpStatus.breadcrumbList" :key="index">
            <span @click="handleDialogRollingUp($event, 'breadcrumb-click', item)">{{item.name}}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="content" style="overflow: hidden; position: relative">
        <transition-group name="global-fade-1">
          <div class="work-order-list" style="height: 100%;"
               :key="rollingUpStatus.pageList[0]['key']"
               v-if="rollingUpStatus.currentPageKey === rollingUpStatus.pageList[0]['key']">
            <div class="stage-desc">应用名称：{{actionNew.row.appName}}</div>
            <custom-table-component
                    :data="rollingUpStatus.workOrderList"
                    :showFilter="false"
            >
              <custom-table-column show="workOrderDeployName" label="审批工单名称"></custom-table-column>
              <custom-table-column show="creatorName" label="申请人"></custom-table-column>
              <custom-table-column show="formattedCreateTime" label="申请时间"></custom-table-column>
              <custom-table-column show="workOrderStatusDesc" label="状态"></custom-table-column>
              <custom-table-column show="operation" label="操作">
                <template slot-scope="scope">
                  <el-button
                          size="small"
                          type="text"
                          :loading="statusOfWaitingResponse('go-to-page-deploy-history') && rollingUpStatus.workOrderSelected.id == scope.id"
                          @click="handleDialogRollingUp($event, 'go-to-page-deploy-history', scope)"
                          :class="'primary flex'">
                    <span>查看工单部署历史</span><i class="paas-icon-level-up"></i>
                  </el-button>
                </template>
              </custom-table-column>
            </custom-table-component>
          </div>
          <div class="deploy-history-list" style="height: 100%;"
               :key="rollingUpStatus.pageList[1]['key']"
               v-if="rollingUpStatus.currentPageKey === rollingUpStatus.pageList[1]['key']">
            <div class="stage-desc">工单名称：{{rollingUpStatus.workOrderSelected.workOrderDeployName}}</div>
            <custom-table-component
                    :data="rollingUpStatus.deployHistoryList"
                    :showFilter="false"
            >
              <custom-table-column show="formattedCreateTime" label="部署时间"></custom-table-column>
              <custom-table-column show="deployUserName" label="部署人"></custom-table-column>
              <custom-table-column show="fullImage" label="部署镜像"></custom-table-column>
              <custom-table-column show="deployTypeDesc" label="部署类型"></custom-table-column>
              <custom-table-column show="operation" label="操作">
                <template slot-scope="scope">
                  <el-button
                          size="small"
                          type="text"
                          :loading="statusOfWaitingResponse('go-to-page-deploy-log') && rollingUpStatus.deployHistorySelected.id == scope.id"
                          @click="handleDialogRollingUp($event, 'go-to-page-deploy-log', scope)"
                          :class="'primary flex'">
                    <span>查看部署日志</span><i class="paas-icon-level-up"></i>
                  </el-button>
                  <div class="ant-divider"></div>
                  <el-button
                          size="small"
                          type="text"
                          :loading="statusOfWaitingResponse('deploy-image-confirm') && rollingUpStatus.deployHistorySelected.id == scope.id"
                          @click="handleDialogRollingUp($event, 'deploy-image-confirm', scope)"
                          :class="'primary'">
                    部署镜像
                  </el-button>
                </template>
              </custom-table-column>
            </custom-table-component>
          </div>
          <div :key="rollingUpStatus.pageList[2]['key']" style="height: 100%; display: flex; flex-direction: column"
               v-if="rollingUpStatus.currentPageKey === rollingUpStatus.pageList[2]['key']">
            <div class="stage-desc">工单 "{{rollingUpStatus.workOrderSelected.workOrderDeployName}}" 在 "{{rollingUpStatus.deployHistorySelected.formattedCreateTime}}" 时的部署日志</div>
            <div class="deploy-log" style="flex: 1;" v-if="deployLogs && deployLogs.length > 0">
              <div v-for="(item,index) in deployLogs" :key="index" class="log-item" v-html="item"></div>
            </div>
            <div class="deploy-log" style="flex: 1;" v-else>
              <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-size: 12px; color: white">加载中...</div>
            </div>
          </div>
        </transition-group>
      </div>
    </el-dialog>
    <paas-popover-message ref="rolling-up-image-confirm" popperClass="el-popover--small is-dark"
                          placement="left">
      <div slot="content">
        <div style="font-size: 14px;">您确定要部署当前镜像吗？</div>
        <div style="display: flex; justify-content: space-around; margin-top: 8px;">
          <el-button type="danger" size="mini-extral"
                     @click="$refs['rolling-up-image-confirm'] && $refs['rolling-up-image-confirm'].doClose()">取消</el-button>
          <el-button type="primary" size="mini-extral" :loading="statusOfWaitingResponse('rolling-up-deploy-image')"
                     @click="handleDialogRollingUp($event, 'rolling-up-deploy-image')">确定</el-button>
        </div>
      </div>
    </paas-popover-message>

    <paas-dialog-for-log title="部署日志" :showStatus="dialogForLogStatus" ref="dialog-4-deploy-log">
      <div slot="content">
        <div v-for="(item,index) in deployLogs" :key="index" class="log-item" v-html="item"></div>
      </div>
    </paas-dialog-for-log>
    <paas-dialog-for-log title="镜像回滚日志" :showStatus="rollingUpStatus.deployLogStatus" ref="dialog-4-rolling-up-image">
      <div slot="content">
        <div v-for="(item,index) in deployLogs" :key="index" class="log-item" v-html="item"></div>
      </div>
    </paas-dialog-for-log>

    <el-dialog :visible.sync="hasAffinity" top="30px" width="80%" :fullscreen="false"
               v-loading="saveAffinityLoading"
               element-loading-text="正在保存"
               element-loading-spinner="el-icon-loading"
               element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div class="py-3" style="width: 80%; text-align: left;">
        <h4 style="display: inline;">
          <span style="color: red;">
          亲和性配置
          </span>
        </h4>
        <span>
          <el-tooltip slot="trigger" effect="dark" placement="right">
            <div slot="content">
              <pre>
模板样例如下：
---
nodeAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    nodeSelectorTerms:
    - matchExpressions:
      - key: kubernetes.io/e2e-az-name
        operator: In
        values:
        - e2e-az1
        - e2e-az2
  preferredDuringSchedulingIgnoredDuringExecution:
  - weight: 1
    preference:
      matchExpressions:
      - key: another-node-label-key
        operator: In
        values:
        - another-node-label-value
podAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
  - labelSelector:
      matchExpressions:
      - key: security
        operator: In
        values:
        - S1
    topologyKey: failure-domain.beta.kubernetes.io/zone
podAntiAffinity:
  preferredDuringSchedulingIgnoredDuringExecution:
  - weight: 100
    podAffinityTerm:
      labelSelector:
        matchExpressions:
        - key: security
          operator: In
          values:
          - S2
      topologyKey: kubernetes.io/hostname
              </pre>
            </div>
            <span><i class="paas-icon-fa-question" style="color:#E6A23C"></i></span>
          </el-tooltip>
        </span>
      </div>

      <div class="__editor">
        <codemirror v-model="configOfAffinity" :options="editorAffinityOptions"></codemirror>
      </div>

      <div slot="footer" class="pa-3" style="text-align: center">
        <el-button type="success" size="medium" @click="saveAffinityConfig(false)">&emsp;保 存 配 置&emsp;</el-button>
        <el-button type="success" size="medium" @click="saveAffinityConfig(true)">&emsp;保 存 并 生 效&emsp;</el-button>
        <el-button type="danger" size="medium" @click="hasAffinity = false">&emsp;取 消 修 改&emsp;</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="hasK8sResourceInfo" top="30px" width="80%" :fullscreen="false"
               element-loading-text="正在保存"
               element-loading-spinner="el-icon-loading"
               element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div class="py-3" style="width: 80%; text-align: left;">
        <h4 style="display: inline;">
          <span style="color: red;">
          K8S实时信息展示
          </span>
        </h4>
      </div>

      <div class="__editor">
        <codemirror v-model="configOfK8sResource" :options="showK8sResourceOptions"></codemirror>
      </div>

      <div slot="footer" class="pa-3" style="text-align: center">
        <el-button type="danger" size="medium" @click="hasK8sResourceInfo = false">&emsp;关 闭&emsp;</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<style lang="scss">
  @mixin log-item() {
    .log-item {
      /*white-space: pre;*/
      max-width: 100%;
      word-wrap: break-word;
      word-break: break-all;
      line-height: 1.4;
      font-size: 12px;
      color: white;
      .info {
        color: #409EFF;
        font-weight: bold;
      }
      .warning {
        color: #E6A23C;
        font-weight: bold;
      }
      .error {
        color: #F56C6C;
        font-weight: bold;
      }
      .success {
        color: #67C23A;
        font-weight: bold;
      }
    }
  }
  #service-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 1500px;
    background: white;

    .el-dialog__wrapper.image_rollback {
      .el-dialog {
        width: 95%;
        max-width: 1500px;
        height: 70%;
        .el-dialog__header {
          padding: 3px 8px;
          margin-bottom: 0px;
          button {
            top: 6px;
          }
        }
        .el-dialog__body {
          height: calc(100% - 30px);
          padding: 0px;
          .content {
            height: calc(100% - 26px);
            .stage-desc {
              text-align: left;
              font-size: 12px;
              line-height: 24px;
              padding-left: 8px;
              color: #67C23A;
              font-weight: bold
            }
            & > span {
              display: block;
              height: 100%;
              overflow: scroll;
            }
            .deploy-log {
              flex: 1;
              background-color: rgba(0, 0, 0, 0.9);
              text-align: left;
              padding: 0px 2px;
              overflow: scroll;
              @include log-item;
            }
          }
        }
      }

      .assist {
        text-align: left;
        .paas-icon-fa-home {
          line-height: 24px;
          margin: 0px 2px;
        }
        .el-breadcrumb {
          font-size: 14px;
          line-height: 24px;
          display: inline-block;
          .el-breadcrumb__item {
            .el-breadcrumb__separator {
              margin: 0px;
            }
            .el-breadcrumb__inner, .el-breadcrumb__inner a {
              font-weight: normal;
              color: #409EFF
            }
            &:last-child {
              .el-breadcrumb__inner, .el-breadcrumb__inner a {
                color: #5a5e66;
              }
            }
          }
        }
      }
    }
    > .header {
      .el-tabs {
        /*border-right: 1px solid #dfe4ed;*/
        &.el-tabs--border-tab {
          background-color: #f4f5f5;
          #tab-fpdev.is-active {
            border-color: $g-env-fpdev-color;
            color: $g-env-fpdev-color;
          }
          #tab-test.is-active {
            border-color: $g-env-test-color;
            color: $g-env-test-color;
          }
          #tab-performance.is-active {
            border-color: $g-env-performance-color;
            color: $g-env-performance-color;
          }
          #tab-beta.is-active {
            border-color: $g-env-beta-color;
            color: $g-env-beta-color;
          }
          #tab-production.is-active {
            border-color: $g-env-production-color;
            color: $g-env-production-color;
          }
          #tab-staging.is-active {
            border-color: $g-env-staging-color;
            color: $g-env-staging-color;
          }

          >.el-tabs__header {
            .el-tabs__item {
              color: black;
            }
          }
          .el-tabs__content {
            display: none;
          }
        }
      }
      .operation {
        padding: 3px 5px 3px 5px;
        text-align: right;
        /*flex: 1;*/
        /*display: inline-flex;*/
        /*align-items: center;*/
        /*border-top: 1px solid #dfe4ed;*/
        .el-button, el-input {
          margin: 0px 5px;
        }
      }
    }
    > .list {
      .el-table {
        .cell {
          line-height: 18px;
        }
        td {
          padding: 0px 3px;
        }
        .version {
          font-size: 14px;
          line-height: 16px;
        }
        .link {
          color: #409EFF;
          &:hover {
            cursor: pointer;
            text-decoration: underline;
          }
        }
      }

    }
    > .confirm-deploy {
      .el-dialog {
        display: inline-block;
        vertical-align: middle;
        background-color: #fff;
        border-radius: 4px;
        border: 1px solid #e6ebf5;
        font-size: 18px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        text-align: left;
        overflow: hidden;
        backface-visibility: hidden;
        box-sizing: border-box;
      }
      .el-dialog__header {
        position: relative;
        padding: 15px 15px 5px;
        background-color: #fff;
        .el-dialog__title {
          padding-left: 0;
          margin-bottom: 0;
          font-size: 18px;
          line-height: 1;
          color: #2d2f33;
         }
      }
      .el-dialog__body {
        position: relative;
        padding: 10px 15px;
        color: #5a5e66;
        font-size: 14px;
      }
      .el-dialog__footer {
        border-top: none;
        margin-top: 0;
      }
    }
    .dialog-for-log {
      .el-dialog {
        width: 95%;
      }
      @include log-item;
    }
    > .confirm-dialog {
      .el-dialog {
        border-radius: 4px;
        border: 1px solid #e6ebf5;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        text-align: left;
        overflow: hidden;
        backface-visibility: hidden;
        box-sizing: border-box;
        top: 24vh;
      }
      .el-dialog__header {
        position: relative;
        padding: 15px 15px 5px;
        background-color: #fff;
        .el-dialog__title {
          padding-left: 0;
          margin-bottom: 0;
          font-size: 18px;
          line-height: 1;
          color: #2d2f33;
         }
      }
      .el-dialog__body {
        position: relative;
        padding: 10px 15px;
        color: #5a5e66;
        font-size: 14px;
      }
      .service-name {
        padding: 2px 4px;
        font-size: 90%;
        color: #c0341d;
        background-color: #fcedea;
        border-radius: 3px;
      }
      .el-dialog__footer {
        border-top: none;
        margin-top: 0;
      }
    }
  }
</style>
<script>
  import {mapGetters} from 'vuex';
  import commonUtils from 'assets/components/mixins/common-utils';
  import paasDialogForLog from '../components/dialog4log.vue';
  import { TableColumn, TableComponent } from '$components/custom/simple-table';
  import paasPopoverMessage from 'assets/components/popover-message';

  import {codemirror} from "vue-codemirror";
  import "codemirror/lib/codemirror.css";

  // language
  import "codemirror/mode/properties/properties.js";
  import "codemirror/mode/yaml/yaml.js";
  // theme
  import "codemirror/theme/monokai.css";
  // require active-line.js
  import "codemirror/addon/selection/active-line.js";

  export default {
    components: {
      codemirror,
      paasDialogForLog,
      CustomTableColumn: TableColumn,
      CustomTableComponent: TableComponent,
      paasPopoverMessage
    },
    mixins: [commonUtils],
    created() {
      // some logic by the preview route, such as use filterKey in localStorage if pre page is profile/service/modify
      const preRouter = this.$router.helper.preRouter;
      if (preRouter && preRouter.path) {
        switch (preRouter.path) {
          case this.$net.page['profile/service/modify']:
          case this.$net.page['profile/app/update']:
            this.filterKey = this.$storeHelper.getUserConfig('service.filterKey');
            break;
          default:
            this.onFilterKey(this.filterKey);
            break;
        }
      } else {
        this.onFilterKey(this.filterKey);
      }
      const dataTransfer = this.$storeHelper.dataTransfer;
      if (dataTransfer) {
        const from = dataTransfer.from;
        const data = dataTransfer.data;
        switch (from) {
          case this.$net.page['profile/app']:
            if (['appName', 'profileId'].every(prop => {
              return this.$utils.propExists(data, prop);
              })) {
              this.dataPassed.from = from;
              this.dataPassed.data = data;
            }
            if (this.dataPassed.data['appName']) {
              this.filterKey = this.dataPassed.data['appName'];
              this.dataPassed.data['appName'] = null;
            }
            break;
        }
        this.$storeHelper.dataTransfer = null;
      } else {
        const qsObj = this.$utils.parseQueryString(location.search);
        qsObj.hasOwnProperty('groupId') && (this.$storeHelper.currentGroupID = qsObj['groupId']);
        qsObj.hasOwnProperty('appName') && (this.dataPassed.data['appName'] = qsObj['appName']);
        qsObj.hasOwnProperty('profileName') && (this.dataPassed.data['profileName'] = qsObj['profileName']);
      }
    },
    mounted() {
      // NOTICE: getServiceListByPage will be called by change of profileName, which is changed onProfileList,
      // so this.getServiceListByPage(); is no need
      this.onProfileList(this.$storeHelper.profileListOfGroup);
      this.$nextTick(() => {
        this.onScreenSizeChange(this.$storeHelper.screen.size);
      });
    },
    beforeDestroy() {
      if (this.$refs['rolling-up-image-confirm']) {
        this.$refs['rolling-up-image-confirm'].doClose();
        this.$refs['rolling-up-image-confirm'].doDestroy();
      }
    },
    computed: {
//      ...mapGetters('user', {
//        'userConfig': 'config'
//      }),
      publishStatus() {
        return this.$store.getters['publishStatus'];
      }
    },
    watch: {
      '$storeHelper.currentGroupID': function (value, oldValue) {
        this.currentPage = 1;
        this.getServiceListByPage({
          refresh: true,
          currentPage: 1
        });
        // dataPassed.data同时包含groupId和appName属性时，appName需要再groupId生效之后生效
        if (this.dataPassed.data['appName']) {
          this.filterKey = this.dataPassed.data['appName'];
          this.dataPassed.data['appName'] = null;
        } else {
          this.filterKey = '';
        }
      },
      'currentPage': function (page) {
        this.getServiceListByPage({});
        this.$storeHelper.setUserConfig('service', {
          currentPage: page
        });
      },
      'filterKey': 'onFilterKey',
      // changed by el-tab
      profileName(profileName) {
       // console.log(`change profileName to ${profileName}`);
        const target = this.$storeHelper.profileListOfGroup.find(it => it.name === profileName);
        if (target) {
          this.profileInfo = target;
          this.isProductionProfile = target.spaceType.toUpperCase() === 'PRODUCTION';
        } else {
          console.log(`${profileName} not exist`);
        }
        var currentPage = 1;
        const localCurrentPage = this.$storeHelper.getUserConfig('service.currentPage');
        if (localCurrentPage) {
          currentPage = parseInt(localCurrentPage);
        }
        if (!this.$utils.isNumber(currentPage)) {
          currentPage = 1;
        }
        this.currentPage = currentPage;
        this.getServiceListByPage({
          refresh: true,
          currentPage
        });
        this.$storeHelper.setUserConfig('service', {
          profileName
        });
      },
      '$storeHelper.screen.size': 'onScreenSizeChange',
      '$storeHelper.profileListOfGroup': 'onProfileList',
      '$storeHelper.appInfoListOfGroup': function() {
        this.getAppWithoutService();
      },
    },
    data() {
      return {
        dataPassed: {
          from: null,
          data: {}
        },
        // TODO: for change internetDomain, will change later
        waitingResponse: false,
        heightOfTable: '',

        filterKey: '',
        profileName: null,
        profileInfo: null,
        isProductionProfile: false,
        serviceList: [],
        serviceListByPage: [],
        // 没有服务的appId列表
        appIdWithoutService: [],
        // 没有服务的app详情列表
        appWithoutService: [],

        totalSize: 0,
        pageSize: 10,
        currentPage: 1,

        action: {
          evt: null,
          name: null,
          row: null
        },
        // actionNew will replace action
        actionNew: {
          row: null,
          name: null,
          promise: {
            resolve: () => {},
            reject: () => {},
          },
          dataOrigin: null,
          data: null
        },
        // status for dialog image_rollback
        rollingUpStatus: {
          currentPageKey: null,
          breadcrumbList: [],
          pageList: [{
            key: 'work-order',
            name: '工单列表'
          }, {
            key: 'deploy-history',
            name: '部署历史'
          }, {
            key: 'deploy-log',
            name: '部署日志'
          }],

          workOrderSelected: {},
          workOrderList: [],

          deployHistorySelected: {},
          deployHistoryList: [],

          deployLogStatus: {
            visible: false,
            full: false,
            showLoading: false,
            iconExpand: true
          }
        },

        deployLogs: [],
        dialogForLogStatus: {
          visible: false,
          full: false,
          showLoading: false,
          iconExpand: true
        },

        props4CreateDomain: {
          prefixName: '',
          subDomain: '',
          subDomainList: [],
          domainToAdd: [],
          // 校验规则：单个元素（语法校验）
          errMsgForDomainName: '',
          // 校验规则：域名数组（大于一个小于五个，无域名后缀）
          errMsgForDomainList: ''
        },
        hasK8sResourceInfo: false,
        configOfK8sResource: "",
        showK8sResourceOptions: {
          tabSize: 4,
          styleActiveLine: true,
          lineNumbers: true,
          line: true,
          mode: "text/x-properties",
          theme: "monokai",
          readOnly: true,
          viewportMargin: 10
        },
        hasAffinity: false,
        affinityEditError: false,
        affinityDescribeError: "",
        configOfAffinity: "",
        saveAffinityLoading: '',
        editorAffinityOptions: {
          tabSize: 4,
          styleActiveLine: true,
          lineNumbers: true,
          line: true,
          mode: "text/x-properties",
          theme: "monokai",
          readOnly: false,
          viewportMargin: 10
        },
      }
    },
    methods: {
      onScreenSizeChange(size) {
        if (!size) {
          return;
        }
        try {
          const headerNode = this.$el.querySelector(':scope > .header');
          const headerHeight = headerNode.offsetHeight;
          this.heightOfTable = this.$el.clientHeight - headerHeight;
        } catch(err) {
        }
      },
      onFilterKey (value) {
        this.getServiceListByPage({
          currentPage: 1
        });
        this.$storeHelper.setUserConfig('service', {
          filterKey: value
        });
      },
      onProfileList(profileList) {
        if (!Array.isArray(profileList) || profileList.length === 0) {
          console.log('error: onProfileList');
          return;
        }
        var profileInfo = profileList[0];

        const localProfileName = this.$storeHelper.getUserConfig('service.profileName');
        const localProfileInfo = profileList.find(it => it.name == localProfileName);
        if (localProfileInfo) {
          profileInfo = localProfileInfo;
        }

        var profileInfoPassed = null;
        if (this.dataPassed.data.profileId) {
          profileInfoPassed = profileList.find(it => it.id == this.dataPassed.data.profileId);
          if (profileInfoPassed) {
            profileInfo = profileInfoPassed;
            this.dataPassed.data.profileId = null;
          }
        } else if (this.dataPassed.data.profileName) {
          profileInfoPassed = profileList.find(it => it.name == this.dataPassed.data.profileName);
          if (profileInfoPassed) {
            profileInfo = profileInfoPassed;
            this.dataPassed.data.profileName = null;
          }
        }

        this.profileInfo = profileInfo;
        this.profileName = profileInfo['name'];
      },

      openDialog(name, data) {
        if (data) {
          this.actionNew.dataOrigin = data;
          this.actionNew.data = this.$utils.cloneDeep(data);
        }
        this.actionNew.name = name;
        // console.log(this.actionNew);

        return new Promise((resolve, reject) => {
          this.actionNew.promise.resolve = resolve;
          this.actionNew.promise.reject = reject;
        });
      },
      closeDialog() {
        this.actionNew.name = null;
        this.actionNew.promise.reject('cancel');
      },
      async handleDialogEvent(evt, action, data) {
//        console.log(evt, action);
        try {
          switch (action) {
            case 'service_deploy':
                this.actionNew.promise.resolve(this.actionNew.data);
              break;
          }
        } catch(err) {
          console.log(err);
        }
      },

      // action handler for dialog image_rollback related
      async handleDialogRollingUp(evt, action, data) {
        var resContent = null
        switch (action) {
          case 'breadcrumb-click':
            this.rollingUpStatus.breadcrumbList = [];
            this.rollingUpStatus.pageList.some(it => {
              this.rollingUpStatus.breadcrumbList.push(it);
              return it === data;
            });
            this.rollingUpStatus.currentPageKey = data['key'];
            break;
          case 'go-to-page-deploy-history':
            // 工单部署日志
            this.rollingUpStatus.deployHistoryList = [];
            resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.latest_deploy_log_by_work_order, {
              params: {
                serviceId: this.actionNew.row.id,
                workOrderId: data.workOrderDeployId
              }
            });
            this.rollingUpStatus.deployHistoryList = resContent.map(it => {
              it.formattedCreateTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
              it.userName = it.userId;
              return it;
            }).sort((pre, next) => {
              return (pre.createTime - next.createTime) * -1;
            });
            this.rollingUpStatus.workOrderSelected = data;
            this.handleDialogRollingUp(evt, 'breadcrumb-click', this.rollingUpStatus.pageList.find(it => it.key === 'deploy-history'));
            break;
          case 'go-to-page-deploy-log':
            // 去部署日志页面
            try {
              this.rollingUpStatus.deployHistorySelected = data;
              this.handleDialogRollingUp(evt, 'breadcrumb-click', this.rollingUpStatus.pageList.find(it => it.key === 'deploy-log'));
              await this.serviceDeploy({
                logName: data.logName,
                logPath: data.logPath,
                logType: "history",
                offset: 0
              }, 'get_deploy_history');
            } catch (err) {
              console.log(err);
            }
            break;
          case 'deploy-image-confirm':
            if (this.$refs['rolling-up-image-confirm']) {
              this.$refs['rolling-up-image-confirm'].show({
                ref: evt.target,
                type: 'node'
              });
            }
            this.rollingUpStatus.deployHistorySelected = data;
            break;
          case 'rolling-up-deploy-image':
            // 回滚镜像
            this.addToWaitingResponseQueue(action);
            try {
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.image_rollback, {
                payload: {
                  image: this.rollingUpStatus.deployHistorySelected.fullImage,
                  id: this.actionNew.row.id,
                  appId: this.actionNew.row.appId,
                  spaceId: this.profileInfo.id,
                  groupId: this.$storeHelper.currentGroupID,
                }
              });
              if ([
                  'orchestration.logName',
                  'orchestration.logPath',
                ].every(prop => {
                  return this.$utils.propExists(resContent, prop);
                })
              ) {
                this.closeDialog();
                await this.serviceDeploy({
                  logName: resContent.orchestration.logName,
                  logPath: resContent.orchestration.logPath,
                  offset: 0
                }, 'get_image_rollback_log');
              } else {
                console.log('信息不完整');
              }
              this.hideWaitingResponse(action);
            } catch(err) {
              console.log(err);
              this.hideWaitingResponse(action);
            }
            break;
        }
      },

      handleButtonClick(evt, action) {
        if (action === 'service_create' && this.appIdWithoutService.length === 0) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: '当前环境下，没有可以创建的服务'
          });
          return;
        }
        if (this.$storeHelper.permission.hasOwnProperty(action) && this.$storeHelper.permission[action].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[action].reason
          });
          return;
        }
        switch (action) {
          case 'service_create':
            this.goToPageServiceAdd('service_create');
            break;
          case 'refresh-list':
            this.getServiceListByPage({
              refresh: true,
              currentPage: 1
            });
            break;
        }
      },

      // TODO: not used
      // 需要传递到其它页面的本地页面信息
      getPageStateToTransfer(action) {
        return {
          path: this.$net.page['profile/service'],
          action,
        }
      },

      // 获取制定运行环境下没有服务的应用列表（只有没有服务的应用才可以创建服务）
      getAppWithoutService() {
        var appWithoutService = [];
        if (!this.$storeHelper.appInfoListOfGroup) {
          console.log('未获得应用列表信息');
        } else {
          appWithoutService = this.$storeHelper.appInfoListOfGroup['appModelList'].filter(it => {
            return this.appIdWithoutService.indexOf(it['appId']) > -1;
          });
        }
        return appWithoutService;
      },

      async goToPageServiceAdd(action, row) {
        const basicInfo = {
          profileInfo: this.profileInfo
        };
        switch (action) {
          case 'service_create':
            this.appWithoutService = this.getAppWithoutService();
            this.$storeHelper.dataTransfer = {
              from: this.getPageStateToTransfer(action),
              data: Object.assign(basicInfo, {
                appWithoutService: this.appWithoutService,
              })
            };
            this.$router.push(this.$net.page['profile/service/add']);
            break;
          case 'service_config_add':
            this.$storeHelper.dataTransfer = {
              from: this.getPageStateToTransfer(action),
              data: Object.assign(basicInfo, {
                // TODO: 使用的是运行时信息，可能需要修改为数据库信息
                serviceBasicInfo: row
              })
            };
            this.$router.push(this.$net.page['profile/service/add']);
            break;
          case 'service_update':
            let model1 = await this.getServiceByAppIdAndSpaceId(row);
            if (model1) {
              this.$storeHelper.dataTransfer = {
                from: {
                  path: this.$net.page['profile/service'],
                  action,
                },
                data: Object.assign(basicInfo, {
                  serviceInfo: model1
                })
              };
              this.$router.push(this.$net.page['profile/service/modify']);
            } else {
              return;
            }
            break;
          case 'service_config_copy':
            let resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_not_exists_in_space, {
              query: {
                appId: row.appId,
              }
            });
            let notServiceSpaceList = resContent["notServiceSpaceList"];
            if (notServiceSpaceList.length == 0 ) {
              this.$message({
                showClose: true,
                message: "该应用在所有环境下都有服务，不能进行复制!",
                type: "error",
              });
              return;
            }
            let model2 = await this.getServiceByAppIdAndSpaceId(row);
            if (model2) {
              this.$storeHelper.dataTransfer = {
                from: {
                  path: this.$net.page['profile/service'],
                  action,
                  page: this.currentPage,
                  profileInfo: this.profileInfo
                },
                data: Object.assign(basicInfo, {
                  serviceInfo: model2,
                  notServiceSpaceList: notServiceSpaceList,
                })
              };
              this.$router.push(this.$net.page['profile/service/copy']);
            } else {
              return;
            }
            break;
        }
      },

      // 是否支持快速部署（重启）：1. 是k8s应用，2. 有正在运行的实例
      reason4DisableQuickDeploy(row) {
        var reason = false;
        if (row) {
          if (row['k8s'] !== 1) {
            reason = '老mesos应用不支持';
          } else if (row['containerStatus'] && row['containerStatus']['Running'] == 0) {
            reason = '运行实例数为0，不能进行重启操作！';
          }
        }
        if (this.isProductionProfile && this.$storeHelper.permission['service_restart_production'].disabled) {
          reason = '您无权使用该功能';
        }
        return reason;
      },

      getVersionDescription() {
        if (!this.action.row) {
          return;
        }
        const row = this.action.row;
        const profileInfo = this.profileInfo;
        const description = profileInfo && profileInfo.hasOwnProperty('description') ? profileInfo.description : '';
        const desc = `应用"${row.appName}:${description}"的服务`;
        return desc;
      },

      expiredDaysAutoAdd() {
        if (!this.action.row) {
          return;
        }
        const row = this.action.row;

        if(!this.isProductionProfile){
          let options = {
            appId: row.appId,
            spaceId: this.profileInfo.id,
            id: row.id,
            expiredDays: 1,
            remainExpiredDays: row.remainExpiredDays,
          };
          this.$net.serviceUpdate("expiredDays", options).then(msg => {
            if(row.remainExpiredDays >= 0 && row.remainExpiredDays < 365) {
              row.remainExpiredDays += 1;
            }else if (row.remainExpiredDays < 0){
              row.remainExpiredDays = 1;
            }
          }).catch(errMsg => {
            console.log(errMsg);
          })
        }
      },

      // 部署服务
      async serviceDeploy(payload, action) {
        // request and show log
        const filterReg = /^ *\[( *(?:INFO|WARNING|ERROR) *)\](.*)$/;
        const parseDeployLog = (logs) => {
          var logObjList = logs ? logs.split('\n').filter(it => {
            return it;
          }).map(it => {
            var logObj = {
              LOG: '',
              TYPE: 'DEFAULT'
            };
            try {
              var parsedLog = JSON.parse(it);
              if (this.$utils.isObject(parsedLog) && parsedLog.hasOwnProperty('TYPE') && parsedLog.hasOwnProperty('LOG')) {
                logObj = parsedLog;
              } else {
                throw new Error('格式不正确');
              }
            } catch (err) {
              logObj['LOG'] = it;
            }
            return logObj;
          }) : [];

          logObjList.forEach(it => {
            // replace white-space with &nbsp
            it['LOG'] = it['LOG'].replace(/^( *)(.*)$/, (match, p1, p2) => {
              return '&nbsp;'.repeat(p1.length) + p2;
            }).replace(filterReg, (match, p1, p2, offset, string) => {
              // console.log(match, p1, offset, string);
              p2 = p2.replace(/(BUILD )*SUCCESS/g, (match, p1, offset, string) => {
                return `<span class="success">${match}</span>`;
              });
              p2 = p2.replace(/BUILD FAILURE/g, (match, p1, offset, string) => {
                return `<span class="error">${match}</span>`;
              });
              let result = '';
              switch (p1.toUpperCase()) {
                case 'INFO':
                  result = `[<span class="info">${p1}</span>]${p2}`;
                  break;
                case 'WARNING':
                  result = `[<span class="warning">${p1}</span>]${p2}`;
                  break;
                case 'ERROR':
                  result = `[<span class="error">${p1}</span>]<span class="error">${p2}</span>`;
                  break;
              }
              return result;
            })
          });
          return logObjList;
        };

        // recursive function to fetch log from server with options {logName, logPath, offset}
        const getDeployLog = async (options) => {
          // stop request deploy log when the window is closed
          if (!dialogStatus.visible) {
            return Promise.reject('弹框关闭');
          }
          const resContent = await this.$net.serviceGetDeployLog(options);
          if (resContent.hasOwnProperty('Orchestration')) {
            const orchestration = resContent['Orchestration'];
            orchestration.logList = parseDeployLog(orchestration.log);
            return orchestration;
          } else {
            throw new Error('格式不正确');
          }
        };

        var resContent = null;
        var dialogStatus = {
          visible: false,
          full: false,
          showLoading: false,
          iconExpand: true
        };
        var dialogRef = null;
        switch (action) {
          case 'service_deploy':
            resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_deploy, {
              payload
            });
            dialogStatus = this.dialogForLogStatus;
            dialogRef = 'dialog-4-deploy-log';
            //每次点击部署,过期时间自动加1
            this.expiredDaysAutoAdd();
            break;
          case 'quick_deploy':
            resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_quick_deploy, {
              payload
            });
            dialogStatus = this.dialogForLogStatus;
            dialogRef = 'dialog-4-deploy-log';
            //每次点击部署,过期时间自动加1
            this.expiredDaysAutoAdd();
            break;
          case 'get_deploy_history':
            resContent = {
              orchestration: {
                logName: payload.logName,
                logPath: payload.logPath,
                offset: 0,
                moreData: true
              }
            };
//            dialogStatus = this.rollingUpStatus.deployLogStatus;
            break;
          case 'get_image_rollback_log':
            resContent = {
              orchestration: {
                logName: payload.logName,
                logPath: payload.logPath,
                offset: 0,
                moreData: true
              }
            };
            dialogStatus = this.rollingUpStatus.deployLogStatus;
            dialogRef = 'dialog-4-rolling-up-image';
            break;
        }
        // 如果应用没有填写：应用维护者、LOB、Scrum，则不能进行部署、重启（TODO: 这是第二层拦截，第一层拦截如果稳定了，可以删除该逻辑）
        if (resContent === 'SVR_APP_HAS_NO_MAINTAIN_INFO') {
          await this.$confirm(
            '需先完善应用维护者、LOB、Scrum信息，才能进行后续操作。点击确定进入修改应用页面。',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }
          );
          this.$storeHelper.dataTransfer = {
            from: this.$net.page['profile/service'],
            data: this.$storeHelper.getAppInfoByID(payload.appId)['model']
          };
          this.$router.push(this.$net.page['profile/app/update']);
          return Promise.reject('SVR_APP_HAS_NO_MAINTAIN_INFO');
        }
        if (resContent.hasOwnProperty('orchestration')) {
          this.deployLogs = [];
          dialogStatus.visible = true;
          dialogStatus.showLoading = true;
          var orchestration = resContent['orchestration'];
          var moreData = orchestration && orchestration['moreData'];

          var deployLogQueue = [];
          var preItem = null, nextItem = null;
          var tagUpdateDeployLog = null;
          // logType === history: jump all download-record; small time-interval
          if (action === 'get_deploy_history') {
            tagUpdateDeployLog = setInterval(() => {
              if (!moreData && deployLogQueue.length === 0) {
                clearInterval(tagUpdateDeployLog);
                return;
              }
              while (deployLogQueue.length > 0) {
                nextItem = deployLogQueue.shift();
                if (!nextItem) {
                  return;
                }
                if (nextItem['TYPE'] === 'DOWNLOAD' && preItem['TYPE'] === 'DOWNLOAD') {
                } else {
                  this.deployLogs.push(nextItem['LOG']);
                }
                preItem = nextItem;
                // scroll after render finish
                this.$nextTick(() => {
                  if (dialogRef && this.$refs.hasOwnProperty(dialogRef)) {
                    const dialogForDeployLog = this.$refs[dialogRef];
                    dialogForDeployLog.isScrolledBottom && dialogForDeployLog.scrollToBottom();
                  }
                });
              }
            }, 10);
          } else {
            tagUpdateDeployLog = setInterval(() => {
              if (!moreData && deployLogQueue.length === 0) {
                clearInterval(tagUpdateDeployLog);
                return;
              }
              nextItem = deployLogQueue.shift();
              if (!nextItem) {
                return;
              }
              if (nextItem['TYPE'] === 'DOWNLOAD' && preItem['TYPE'] === 'DOWNLOAD') {
                this.deployLogs.pop();
                this.deployLogs.push(nextItem['LOG']);
              } else {
                this.deployLogs.push(nextItem['LOG']);
              }
              preItem = nextItem;
              // scroll after render finish
              this.$nextTick(() => {
                if (dialogRef && this.$refs.hasOwnProperty(dialogRef)) {
                  const dialogForDeployLog = this.$refs[dialogRef];
                  dialogForDeployLog.isScrolledBottom && dialogForDeployLog.scrollToBottom();
                }
              });
            }, 5);
          }

          while(moreData) {
            await new Promise((resolve) => {
              setTimeout(resolve, 1500);
            });
            orchestration = await getDeployLog({
              logName: orchestration.logName,
              logPath: orchestration.logPath,
              offset: null == orchestration.offset ? 0 : orchestration.offset,
              // 正在部署中的日志
              logType: payload.logType
            });
            // console.log(orchestration);
            if (orchestration && orchestration.hasOwnProperty('logList')) {
              // stop showLoading when orchestration.log is not null
              dialogStatus.showLoading = false;
              deployLogQueue = deployLogQueue.concat(orchestration['logList']);
            }
            moreData = orchestration && orchestration['moreData'];
          }
          return Promise.reject('已拉取所有日志');
        } else {
          return Promise.reject({
            title: '数据格式错误',
            message: '未找到orchestration'
          })
        }
      },

      getInfoForMsgBox(action) {
        if (!['quick_deploy', 'service_stop', 'service_delete'].includes(action)) {
          return null;
        }
        if (!this.actionNew.row) {
          return;
        }
        const h = this.$createElement;
        const row = this.action.row;
        const profileInfo = this.profileInfo;
        const description = profileInfo && profileInfo.hasOwnProperty('description') ? profileInfo.description : '';
        const service = `${row.appName}:${description}`;
        const serviceNameStyle = {
          padding: ['1px', '2px'],
          fontSize: '90%',
          color: '#c0341d',
          backgroundColor: '#fcedea',
          borderRadius: '3px'
        };
        const descMap = {
          service_delete: {
            serviceName: service,
            title: '删除服务',
            vNodes: [
              h('div',
                {
                  style: {
                    fontSize: '14px',
                  }
                },
                [
                  h('div', null, [
                    '您确定要删除服务"',
                    h('span', {
                        style: serviceNameStyle
                      },
                      service
                    ),
                    '"吗？'
                  ]),
                  h('div', null, '删除服务将会销毁代码和配置信息，同时自动解绑外网二级域名，删除后服务数据不可恢复。'),
                  h('div', null, [
                    '请在下面输入框中输入服务名称"',
                    h('span', {
                        style: serviceNameStyle
                      },
                      service
                    ),
                    '"确认删除该服务'
                  ]),
                ]
              ),
            ]
          },
          service_stop: {
            serviceName: service,
            title: '停止服务',
            vNodes: [
              h('div',
                {
                  style: {
                    fontSize: '14px',
                  }
                },
                [
                  h('div', null, [
                    '您确定要停止服务"',
                    h('span', {
                        style: serviceNameStyle
                      },
                      service
                    ),
                    '"吗？'
                  ]),
                  h('div', null, '停止服务会导致服务不可用，但不会删除代码及配置信息。'),
                  h('div', null, [
                    '请在下面输入框中输入服务名称"',
                    h('span', {
                        style: serviceNameStyle
                      },
                      service
                    ),
                    '"确认停止该服务'
                  ]),
                ]
              ),
            ]
          },
          quick_deploy: {
            serviceName: service,
            title: '重启服务',
            vNodes: [
              h('div',
                {
                  style: {
                    fontSize: '14px',
                  }
                },
                [
                  h('div', null, [
                    '您确定要重启服务"',
                    h('span', {
                        style: serviceNameStyle
                      },
                      service
                    ),
                    '"吗？'
                  ]),
                  h('div', null, '重启服务会采用最近一次部署成功的镜像进行服务的重新启动，跳过代码编译、镜像生成阶段。'),
                  h('div', null, [
                    '请在下面输入框中输入服务名称"',
                    h('span', {
                        style: serviceNameStyle
                      },
                      service
                    ),
                    '"确认重启该服务'
                  ]),
                ]
              ),
            ]
          }
        };
        return descMap[action];
      },
      handleSuccessCopy(evt) {
        this.$storeHelper.globalTip.show({
          ref: evt.trigger,
          msg: '复制成功'
        });
      },

      // 如果应用没有填写：应用维护者、LOB、Scrum，则不能进行部署、重启
      async checkAppInfo(row) {
        var appInfo = this.$storeHelper.getAppModelById(row.appId);
        if (appInfo.lobId != null && appInfo.scrumId != null && appInfo.maintainerList != null
          && Array.isArray(appInfo.maintainerList) && appInfo.maintainerList.length > 0) {
          return;
        }
        await this.$confirm(
          '需先完善应用的维护者、LOB、Scrum信息，才能进行后续操作。点击确定进入修改应用页面。',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
        this.$storeHelper.dataTransfer = {
          from: this.$net.page['profile/service'],
          data: appInfo
        };
        this.$router.push(this.$net.page['profile/app/update']);
        return Promise.reject('请填写应用信息：维护者、LOB、Scrum');
      },

      async saveAffinityConfig(enforce) {
        let confirmInfo = "点击保存配置时，只保存yaml数据配置，后面当点击部署或重启时才生效！";
        let url = this.$net.URL_LIST.update_affinity_config;
        if (enforce) {
          confirmInfo = "点击“保存并生效”时，保存yaml数据配置的同时，会立即生效该配置，满足亲和性条件时将造成实例重启！";
          url = this.$net.URL_LIST.update_affinity_sync_k8s;
        }

        await this.$confirm(
          confirmInfo,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );

        this.saveAffinityLoading = true;
        // await this.$net.requestPaasServer(this.$net.URL_LIST.update_affinity_config, {
        await this.$net.getResponse(url, {
          payload: {
            spaceId: this.profileInfo.id,
            groupId: this.$storeHelper.groupInfo.id,
            namespace: this.$storeHelper.groupInfo.tag,
            appConfigId: this.action.row.id,
            affinityContent: this.configOfAffinity,
            configServiceName: this.action.row.serviceName
          }
        }).then(response => {
          const resData = response.data;
          if (resData.code && "ERR_UPDATE_AFFINITY_FORMAT_FAILED" === resData.code) {
            // this.$message.warning(resData.msg);
            this.affinityDescribeError = resData.msg;
            this.affinityEditError = true;
          } else {
            this.$message.success("修改亲和性配置成功！");
            this.hasAffinity = false;
          }
        }).catch(err => {
          // console.log(err);
          this.$message.error("保存配置失败，请联系云平台！");
        }).finally(() => {
          this.saveAffinityLoading = false;
        });
      },

      async handleTRClick(evt, action, index, row) {
        var permission = action;
        if (['service_config_add','service_config_copy','service_delete', 'service_deploy', 'image_rollback',
            'quick_deploy','service_config_modify','service_stop','service_update', 'update_affinity'].indexOf(action) > -1 && this.publishStatus) {
          this.$storeHelper.popoverWhenPublish(evt.target);
          return;
        }
        // 创建服务
        if (action == 'service_config_add') {
          permission = 'service_create';
        }
        // 修改服务
        if (action == 'service_config_copy') {
          permission = 'copy-service'
        }
        // 修改Node亲和性
        if (action == 'update_affinity') {
          permission = 'update_affinity'
        }

        if (action === 'service_stop' && row.containerStatus.Total == 0) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: `当前运行实例数为0，不能进行停止操作`
          });
          return;
        }

        if (action === 'update_affinity' && row.containerStatus.Total == 0) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: `当前运行实例数为0，不能修改亲和性`
          });
          return;
        }

        if (this.$storeHelper.permission.hasOwnProperty(permission) && this.$storeHelper.permission[permission].disabled) {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: this.$storeHelper.permission[permission].reason
          });
          return;
        }
        if (action === 'k8s-tag') {
          this.$storeHelper.globalPopover.show({
            ref: evt.target,
            msg: `这是一个${row.k8s === 1 ? 'k8s':'mesos'}服务`
          });
          return;
        }
        this.action.name = action;
        this.action.row = row;
        this.actionNew.row = row;
        var resContent = null;
        var obj = null;
        switch (action) {
          case 'go_to_page_app_list':
            this.$storeHelper.dataTransfer = {
              from: this.$net.page['profile/service'],
              data: {
                appName: row.appName
              }
            };
            this.$router.push(this.$net.page['profile/app']);
            break;
          case 'go_to_intranet_domain':
            window.open(row.intranetDomain, '_blank');
            break;
          case 'service_config_add':
            this.goToPageServiceAdd(action, row);
            break;
          case 'service_update':
            try {
              await this.checkAppInfo(row);
              this.goToPageServiceAdd(action, row);
            } catch (err) {
              console.log(err);
            }
            break;
          case 'service_config_copy':
            this.goToPageServiceAdd(action, row);
            break;
          case 'go-to-page-service-detail-from-page-service':
          case 'go-to-work-order-todo-add':
          case 'go-to-page-log-deploy-from-service':
          case 'go-to-instance-list':
          case 'go-page-domain-from-service':
            const data = {
              appId: row.appId,
              profileId: this.profileInfo.id,
              serviceId: row.id,
              serviceInfo: row,
              profileInfo: this.profileInfo
            };
//            console.log(row);
//            console.log(data);
            if (!data.appId || !data.profileId || !data.serviceId) {
              this.$message.error('所需信息不完整！');
              return;
            }

            this.$storeHelper.dataTransfer = {
//              from: this.getPageStateToTransfer(action),
              from: this.$net.page['profile/service'],
              data
            };
            const PATH_MAP = {
              'go-to-page-service-detail-from-page-service': this.$net.page['profile/service/detail'],
              'go-to-work-order-todo-add': this.$net.page['profile/work-order/todo/add'],
              'go-to-page-log-deploy-from-service': this.$net.page['profile/log/deploy'],
              'go-to-instance-list': this.$net.page['profile/instance'],
              'go-page-domain-from-service': this.$net.page['profile/domain']
            };
            this.$router.push(PATH_MAP[action]);
            break;
          // 部署服务。弹框有checkbox提示：强制清空打包目录（删除所有源代码、包文件等）
          case 'service_deploy':
            try {
              this.addToWaitingResponseQueue(action);
              await this.checkAppInfo(row);
              await this.openDialog(action, {
                serviceDesc: this.getVersionDescription(),
                forceClone: false
              });
              this.closeDialog();
              await this.serviceDeploy({
                id: row.id,
                appId: row.appId,
                spaceId: this.profileInfo.id,
                forceClone: this.actionNew.data.forceClone,
                logType: 'deployLog'
              }, action);
            } catch (err) {
              console.log(err);
            } finally {
              this.closeDialog();
              this.hideWaitingResponse(action);
            }
            break;
          case 'quick_deploy':
            try {
              let reason = this.reason4DisableQuickDeploy(row);
              if (reason) {
                this.$storeHelper.globalPopover.show({
                  ref: evt.target,
                  msg: reason
                });
                return;
              }
              await this.checkAppInfo(row);

              this.addToWaitingResponseQueue(action);

              obj = this.getInfoForMsgBox(action);
              if (this.profileInfo.spaceType === 'PRODUCTION') {
                this.actionNew.data = '';
                await this.$msgbox({
                  title: obj.title,
                  message: this.$createElement('div', null, obj.vNodes),
                  showCancelButton: true,
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  $type: 'prompt',
                  showInput: true,
                  inputPlaceholder: '输入红色背景的文本',
                  inputValidator: (inputValue) => {
                    if (inputValue !== obj.serviceName) {
                      return '服务名称填写不正确';
                    } else {
                      return true;
                    }
                  },
                  beforeClose(action, component, done) {
                    if (action === 'confirm') {
                      component.confirmButtonLoading = true;
                      setTimeout(() => {
                        component.confirmButtonLoading = false;
                        done();
                      }, 500);
                    } else {
                      done();
                    }
                  }
                });
              } else {
                await this.$confirm(
                  `<p>您确认要重启服务 "${obj.serviceName}" 吗?</p><p style="color: #E6A23C; font-size: 12px;">(重启：采用最近一次部署成功的镜像进行服务的重新启动，跳过代码编译、镜像生成阶段)</p>`,
                  '提示',
                  {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    dangerouslyUseHTMLString: true
                  }
                );
              }
              await this.serviceDeploy({
                id: row.id,
                appId: row.appId,
                spaceId: this.profileInfo.id,
                logType: 'deployLog'
              }, action);
            } catch (err) {
              console.log(err);
            } finally {
              this.hideWaitingResponse(action);
            }
            break;
          case 'image_rollback':
            try {
              this.addToWaitingResponseQueue(action);
              this.rollingUpStatus.workOrderList = [];
                resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.lastest_work_order_by_service, {
                params: {
                  serviceId: row.id
                }
              });
              this.rollingUpStatus.workOrderList = resContent.map(it => {
                it.formattedCreateTime = this.$utils.formatDate(it.createTime, 'yyyy-MM-dd hh:mm:ss');
                return it;
              });
//              console.log(this.rollingUpStatus.workOrderList);
              this.handleDialogRollingUp(null, 'breadcrumb-click', this.rollingUpStatus.pageList[0]);
              await this.openDialog(action, {
                deployHistoryList: [],
                deployLog: []
              });
//              this.closeDialog();
              this.hideWaitingResponse(action);
            } catch (err) {
              console.log(err);
              this.closeDialog();
              this.hideWaitingResponse(action);
            }
            break;
          case 'service_stop':
            this.addToWaitingResponseQueue(action);
            var desc = this.getVersionDescription();
            try {
              if (this.profileInfo.spaceType === 'PRODUCTION') {
                this.actionNew.data = '';
                obj = this.getInfoForMsgBox(action);
                await this.$msgbox({
                  title: obj.title,
                  message: this.$createElement('div', null, obj.vNodes),
                  showCancelButton: true,
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  $type: 'prompt',
                  showInput: true,
                  inputPlaceholder: '输入红色背景的文本',
                  inputValidator: (inputValue) => {
                    if (inputValue !== obj.serviceName) {
                      return '服务名称填写不正确';
                    } else {
                      return true;
                    }
                  },
                  beforeClose(action, component, done) {
                    if (action === 'confirm') {
                      component.confirmButtonLoading = true;
                      setTimeout(() => {
                        component.confirmButtonLoading = false;
                        done();
                      }, 500);
                    } else {
                      done();
                    }
                  }
                });
              } else {
                await this.$confirm(`停止将会导致${desc}不可用，但不会删除代码及配置信息，你确定需要这么做吗?`, '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                  dangerouslyUseHTMLString: true
                });
              }
              await this.$net.requestPaasServer(this.$net.URL_LIST.service_stop, {
                payload: {
                  id: row.id,
                  appId: row.appId,
                  spaceId: this.profileInfo.id,
                  groupId: this.$storeHelper.currentGroupID,
                }
              });
              this.hideWaitingResponse(action);
              this.getServiceListByPage({
                refresh: true
              });
            } catch (err) {
              this.hideWaitingResponse(action);
              console.log(err);
            }
            break;
          case 'service_delete':
            this.addToWaitingResponseQueue(action);
            var desc = this.getVersionDescription();
            try {
              if (this.profileInfo.spaceType === 'PRODUCTION') {
                this.actionNew.data = '';
                obj = this.getInfoForMsgBox(action);
                await this.$msgbox({
                  title: obj.title,
                  message: this.$createElement('div', null, obj.vNodes),
                  showCancelButton: true,
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  $type: 'prompt',
                  showInput: true,
                  inputPlaceholder: '输入红色背景的文本',
                  inputValidator: (inputValue) => {
                    if (inputValue !== obj.serviceName) {
                      return '服务名称填写不正确';
                    } else {
                      return true;
                    }
                  },
                  beforeClose(action, component, done) {
                    if (action === 'confirm') {
                      component.confirmButtonLoading = true;
                      setTimeout(() => {
                        component.confirmButtonLoading = false;
                        done();
                      }, 500);
                    } else {
                      done();
                    }
                  }
                });
              } else {
                await this.warningConfirm(`删除服务将会销毁${desc}的代码和配置信息，同时自动解绑外网二级域名，删除后服务数据不可恢复。`);
                await this.warningConfirm(`你确认要删除${desc}，并清除该服务的一切数据？`);
              }
              resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_delete, {
                payload: {
                  id: row.id,
                  appId: row.appId,
                  spaceId: this.profileInfo.id,
                }
              });
              this.hideWaitingResponse(action);
              this.getServiceListByPage({
                refresh: true
              });
            } catch (err) {
              console.log(err);
              this.closeDialog();
              this.hideWaitingResponse(action);
            }
            break;
          case 'v1-add-internetDomain':
            // 兼容v1，为v1团队添加外网域名
//            if (this.model.internetDomainList.length > 0) {
//              this.$storeHelper.globalPopover.show({
//                ref: evt.target,
//                msg: "老团队只支持添加一个外网域名（如想自助式配置外网域名和IP白名单，请联系Paas团队，进行应用迁移）"
//              });
//              break;
//            }
            const subDomainListByProfile = await this.$store.dispatch('app/getSubDomainByProfile', {
              net: this.$net,
              urlDesc: this.$net.URL_LIST.domain_level_1_list_all,
              payload: {groupId: this.$storeHelper.currentGroupID}
            });
//            console.log(subDomainListByProfile);
            this.props4CreateDomain.domainToAdd = [];
            this.props4CreateDomain.prefixName = '';
            this.props4CreateDomain.subDomain = '';
            this.props4CreateDomain.errMsgForDomainName = '';
            this.props4CreateDomain.errMsgForDomainList = '';
            if (subDomainListByProfile.hasOwnProperty(this.profileInfo.name)) {
              this.props4CreateDomain.subDomainList = subDomainListByProfile[this.profileInfo.name];
              this.props4CreateDomain.subDomain = this.props4CreateDomain.subDomainList[0]['domainName'];
            } else {
              this.props4CreateDomain.subDomainList = [];
            }
            break;
          case 'update_affinity':
            // console.log(this.action.row);
            await this.$net.requestPaasServer(this.$net.URL_LIST.get_affinity_config, {
              payload: {
                spaceId: this.profileInfo.id,
                groupId: this.$storeHelper.groupInfo.id,
                namespace: this.$storeHelper.groupInfo.tag,
                appConfigId: this.action.row.id,
                configServiceName: this.action.row.serviceName
              }
            }).then(resp =>{
              if (resp) {
                this.configOfAffinity = resp;
              } else {
                this.configOfAffinity = "";
              }
              this.hasAffinity = true;
            }).catch(error => {
              console.log(error);
            }).finally(()=> {
            });
            break;
          case 'show_info_with_k8s':
            // console.log(this.action.row);
            await this.$net.requestPaasServer(this.$net.URL_LIST.get_resource_information_by_k8s, {
              payload: {
                spaceId: this.profileInfo.id,
                groupId: this.$storeHelper.groupInfo.id,
                namespace: this.$storeHelper.groupInfo.tag,
                appConfigId: this.action.row.id,
                configServiceName: this.action.row.serviceName
              }
            }).then(resp =>{
              if (resp) {
                this.configOfK8sResource = resp;
              } else {
                this.configOfK8sResource = "";
              }
              this.hasK8sResourceInfo = true;
            }).catch(error => {
              console.log(error);
            }).finally(()=> {
            });
            break;
        }
      },

      // TODO: for change internetDomain
      // some init action for domain props
      initDomainProps() {
        this.props4CreateDomain.domainToAdd = [];
        this.props4CreateDomain.prefixName = '';
        this.props4CreateDomain.subDomain = '';
        this.props4CreateDomain.errMsgForDomainName = '';
        this.props4CreateDomain.errMsgForDomainList = '';
      },

      handleDomainInDialog(evt, action, domainItem) {
        const domainToAdd = this.props4CreateDomain.domainToAdd;
        switch (action) {
          case 'remove':
            if (domainToAdd.indexOf(domainItem) > -1) {
              domainToAdd.splice(domainToAdd.indexOf(domainItem), 1);
            }
            break;
          case 'add':
            if (this.props4CreateDomain.domainToAdd.length > 0) {
              this.$storeHelper.globalPopover.show({
                ref: evt.target,
                msg: '只支持添加一个外网域名'
              });
              return;
            }
            this.props4CreateDomain.prefixName = this.props4CreateDomain.prefixName.trim();

            this.props4CreateDomain.errMsgForDomainName = '';
            this.props4CreateDomain.errMsgForDomainList = '';

            if (this.props4CreateDomain.subDomainList.length === 0) {
              this.props4CreateDomain.errMsgForDomainName = '当前运行环境，域名后缀列表为空，无法创建。请联系Paas团队。';
              return;
            }
            if (!/^[a-z0-9][a-z0-9\-]{0,62}$/.exec(this.props4CreateDomain.prefixName)) {
              this.props4CreateDomain.errMsgForDomainName = '可以包含小写字符、数字、中划线，以字符数字开头，长度不超过63位';
              return;
            }
//          if (domainToAdd.length >= 5) {
//            this.props4CreateDomain.errMsgForDomainList = '每次最多添加五个';
//            return;
//          }
            const domain = this.props4CreateDomain.prefixName + '.' + this.props4CreateDomain.subDomain;
//          let item = null;
//          domainToAdd.some(it => {
//            if (it === domain) {
//              item = it;
//            }
//            return item
//          });
//          if (item) {
//            this.props4CreateDomain.errMsgForDomainName = `域名${domain}已经存在！`
//            return;
//          }
            domainToAdd.push(domain);
            this.props4CreateDomain.prefixName = '';
            break;
        }
      },
      v1UpdateInternetDomain() {
        this.waitingResponse = true;
        this.addToWaitingResponseQueue("update-internet-domain");
        if (this.props4CreateDomain.domainToAdd.length === 0) {
          this.props4CreateDomain.errMsgForDomainList = '至少添加一个域名！';
          return;
        }
        const row = this.action.row;
        let options = {
          id: row.id,
          appId: row.appId,
          spaceId: this.profileInfo.id,
        };
        options['outerDomain'] = this.props4CreateDomain.domainToAdd[0];
        this.$net.serviceUpdate('internetDomain', options).then(msg => {
          this.$message({
            type: 'success',
            message: msg
          });
          // 只在更新成功后关闭弹框
          this.showInternetDomainDialog = false;
          this.requestServiceInfo(this.selectedAppID,this.selectedProfileID);
        }).catch(errMsg => {
//          this.$net.showError({
//            title: '修改失败',
//            message: errMsg
//          })
        }).finally(() => {
          this.waitingResponse = false;
          this.hideWaitingResponse("update-internet-domain");
        });
      },

      /**
       * request service list from server
       * only called by getServiceListByPage
       */
      async requestServiceList() {
        this.serviceList = [];
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_profile, {
          payload: {
            groupId: this.$storeHelper.currentGroupID,
            spaceId: this.profileInfo.id
          }
        });
        const parsedResContent = this.$net.parseServiceList(resContent);
        this.serviceList = parsedResContent['serviceModelList'];
        this.serviceList.forEach(it => {
          it.intranetDomain = `http://${it.serviceName}.${this.$storeHelper.groupInfo.tag}.${this.profileInfo.name}`;
        });
        this.totalSize = parsedResContent.total;

        this.appIdWithoutService = [];
        if (parsedResContent.hasOwnProperty('tobeInsertList')) {
          this.appIdWithoutService = parsedResContent['tobeInsertList'];
          this.appWithoutService = this.getAppWithoutService();
        }
//        console.log(resContent);
//        console.log(parsedResContent);
      },

      /**
       * 获取分页的服务列表
       * @param refresh, request service list from server or not
       * @param currentPage, set currentPage by code
       */
      async getServiceListByPage({refresh = false, currentPage = null}) {
        if (refresh) {
          await this.requestServiceList();
        }
        if (currentPage) {
          this.currentPage = currentPage;
        }
        // check currentPage after item delete
        const maxPageSize = Math.ceil(this.totalSize / this.pageSize);
        if (this.currentPage > maxPageSize) {
          this.currentPage = maxPageSize;
        }

        var page = this.currentPage - 1;
        page = page >= 0 ? page : 0;
        const start = page * this.pageSize;
        const length = this.pageSize;
        const end = start + length;

        var filterReg = null;
        if (this.filterKey) {
          filterReg = new RegExp(this.filterKey);
        }
        const filteredServiceList = this.serviceList.filter(it => {
          var result = true;

          if (filterReg) {
            const searchField = `${it.appName}${it.serviceName}${it.tag}`;
            result = filterReg.exec(searchField);
          }
          return result;
        });
        this.totalSize = filteredServiceList.length;
        this.serviceListByPage = filteredServiceList.slice(start, end);
      },

      async getServiceByAppIdAndSpaceId(row) {
        const resContent = await this.$net.requestPaasServer(this.$net.URL_LIST.service_list_by_app_and_profile, {
          payload: {
            appId: row.appId,
            spaceId: this.profileInfo.id
          }
        });
        const parsedContent = this.$net.parseServiceList(resContent);

        let model = null;
        if (parsedContent.hasOwnProperty("serviceModelList")) {
          model = parsedContent["serviceModelList"].find(it => {
            return it["defaultSelect"] === true;
          });
        }
//            console.log(resContent);
//            console.log(parsedContent);
//            console.log(model);
        return model;
      }
    }
  }
</script>

<style lang="scss">
  .__editor {
    text-align: left;
    min-height: 400px;
    .CodeMirror {
      min-height: 480px;
    }
  }
</style>