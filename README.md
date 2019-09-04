### 简介

前端项目。通过webpack预处理vue, scss, js等模块，输出静态h5文件（html, css, js)

线上的两个域名
http://www.finupcloud.com/
http://cloud.renmaitech.com/

cas认证的两个域名
https://cas.renmaitech.com/puhui-cas/login
https://cas.finupgroup.com/puhui-cas/login

### 如何运行

**平台配置**

```
运行平台：node (v8.9.4)，建议通过nvm安装
安装全局依赖包yarn: `npm install yarn -g`
修改npm registry: `npm config set registry https://registry.npm.taobao.org`
安装全局依赖包pm2: `npm install pm2 -g`
```

**本地开发**

```
0. 安装nvm 选择node版本为v8.9.4(nvm install 8.9.4)
1. 初始化submodule（只需运行一次）: git submodule init
2. 更新submodule: git submodule update
3. 添加~/.yarnrc配置参考（https://github.com/webclipper/web-clipper-wxapp/blob/master/.yarnrc）
4. 更新依赖包：yarn
5. 修改后台服务接口（可选）：修改文件/Users/finup/IdeaProjects/fe-paas/build/webpack.dev.conf.js的/j-api/paas/ 指向
6. 本地运行：npm run dev
```

**生产部署**

```
yarn && git submodule init && git submodule update
npm run build
// 存放生成文件的目录：deploy/fe-paas/dist
```

生成静态文件：npm run build:dev（针对dev环境）, npm run build:test（针对测试环境）

### 项目结构（针对 版本v2.0.0）

```
├── app-galaxy，spa项目
│   ├── assets（工具文件夹，只在app-galaxy中使用）
│   │   ├── css
│   │   │   ├── common.scss（通用样式库）
│   │   │   └── fonts（自定义字体）
│   │   │       ├── my-icons.css
│   │   │       ├── my-icons.js
│   │   │       └── my-icons.woff
│   │   ├── js
│   │   │   ├── net.js（网络请求相关父类，存放网络请求的通用操作）
│   │   │   ├── store，vuex store父类
│   │   │   │   ├── helper.js（storeHelper父类提供多个页面通用的操作vuex数据的接口）
│   │   │   │   ├── index.js（vuex入口文件）
│   │   │   │   └── modules
│   │   │   │       └── global.js
│   │   │   ├── url.js（url父类，url通用操作，比如请求端口）
│   │   │   └── utils.js（js常用工具，如日期格式化）
│   │   ├── libs
│   │   │   └── components（vue组件打包，通过webpackChunkName，以独立的方式在前端加载，以便前端缓存，参考app-galaxy/profile.js）
│   │   │       ├── docs.js
│   │   │       └── profile.js
│   │   └── static（静态文件，会通过copy-webpack-plugin拷贝到dist/assets目录）
│   │       ├── files
│   │       │   └── ip白名单.xlsx
│   │       └── imgs（图片文件，按页面分到相应目录）
│   │           ├── default-icon.png
│   │           ├── finup-cloud-2.png
│   │           ├── finup-cloud.png
│   │           ├── index（主页用到的图片）
│   │           │   ├── communication.png
│   │           │   ├── feature-icons.png
│   │           │   ├── poster.png
│   │           │   └── storage.png
│   │           └── profile（控制台页面用到的图片）
│   │               └── create-an-app.png
│   ├── components（多个页面公用的组件）
│   │   ├── header-profile.vue
│   │   └── header.vue
│   ├── config（配置文件）
│   │   ├── network.js（axios网络配置）
│   │   └── vue.js（vue配置，将常用工具挂载到Vue.prototype上，以便在每个vue页面都可以调用）
│   ├── profile（控制台页面）
│   │   ├── net（网络请求相关）
│   │   │   ├── net.js（当前页面用到的ajax请求，继承assets/js/net.js，挂载到Vue.prototype.$net）
│   │   │   └── url.js（当前页面用到的url，继承assets/js/url.js，挂载到Vue.prototype.$url）
│   │   ├── router.js（路由逻辑）
│   │   ├── store（vuex store相关）
│   │   │   ├── index.js
│   │   │   ├── modules
│   │   │   │   ├── app.js
│   │   │   │   ├── tmp.js
│   │   │   │   └── user.js
│   │   │   └── store-helper.js（vuex store常用操作接口，挂载到Vue.prototype.$storeHelper）
│   │   └── pages（页面布局相关）
│   │       ├── profile.vue（控制台主页）
│   │       ├── route.js（路由配置）
│   │       └── profile
│   │           ├── components（profile页面用到的组件）
│   │           │   ├── dialog4log.vue
│   │           │   ├── image-selector.vue
│   │           │   ├── version-condition-filter.vue
│   │           │   └── version-selector.vue
│   │           ├── app（应用管理）
│   │           │   ├── add.vue
│   │           │   └── main.vue
│   │           ├── domain（外网域名）
│   │           │   ├── main.vue
│   │           │   └── white-list.vue
│   │           ├── instance（实例列表）
│   │           │   └── main.vue
│   │           ├── log（日志中心）
│   │           │   ├── deploy.vue
│   │           │   ├── main.vue
│   │           │   └── run.vue
│   │           ├── monitor（应用监控）
│   │           │   └── main.vue
│   │           ├── oauth（Access Key管理）
│   │           │   ├── key.vue
│   │           │   ├── main.vue
│   │           │   └── url.vue
│   │           ├── service（服务管理）
│   │           │   ├── add.vue
│   │           │   └── main.vue
│   │           ├── utils（profile页面用到的逻辑）
│   │           │   └── app-props.js
│   │           └── work-order（审批管理）
│   │               ├── components（审批管理页面用到的组件）
│   │               │   ├── feature.vue
│   │               │   └── show-detail.vue
│   │               ├── list.vue（工单列表）
│   │               ├── main.vue（审批管理主页面）
│   │               ├── todo（待办工单子页）
│   │               │   ├── accept.vue（验收工单）
│   │               │   ├── add.vue（添加工单）
│   │               │   ├── deploy.vue（部署工单）
│   │               │   ├── modify.vue（修改工单）
│   │               │   └── test.vue（测试工单）
│   │               ├── todo.vue（待办工单页）
│   │               └── utils（工具逻辑）
│   │                   ├── data-format.js
│   │                   └── work-order-props.js
│   ├── profile.js（登录页面Vue配置入口）
│   ├── docs（帮助文档页面）
│   │   ├── docs.vue
│   │   └── net（网络请求相关）
│   │       ├── net.js
│   │       └── url.js
│   ├── docs.js（帮助文档的Vue配置入口）
│   ├── index（主页）
│   │   └── index.vue
│   ├── index.js（主页的Vue配置入口）
│   ├── login（登录页面）
│   │   ├── login.vue
│   │   └── net（网络请求相关）
│   │       ├── net.js
│   │       └── url.js
│   ├── login.js（登录页面配置入口）
│   ├── terminal（实例终端页面）
│   │   ├── net
│   │   │   ├── net.js
│   │   │   └── url.js
│   │   └── terminal.vue
│   ├── terminal.js（实例终端页面Vue配置入口）
│   ├── user（用户中心）
│   │   ├── net（用户中心页网络请求相关）
│   │   │   ├── net.js
│   │   │   └── url.js
│   │   └── pages（页面）
│   │       ├── router.js（路由配置）
│   │       ├── user（用户中心子页面）
│   │       │   ├── info.vue
│   │       │   └── operation.vue
│   │       └── user.vue（用户中心首页）
│   └── user.js
├── assets（（工具文件夹，所有项目通用））
│   ├── css
│   │   ├── fix-style.scss
│   │   ├── highlight.scss
│   │   ├── markdown.scss
│   │   ├── mixin.scss
│   │   └── mixins
│   │       └── _vendor-prefixes.scss
│   ├── js
│   │   └── utils.js
│   ├── libs
│   │   ├── components
│   │   │   ├── basic.js
│   │   │   └── element-ui-fix.scss
│   │   └── debug
│   │       ├── browser.js
│   │       ├── debug.js
│   │       ├── index.js
│   │       └── node.js
│   └── static
│       └── libs
│           ├── gateone.js
│           └── lodash
│               ├── lodash.core.js
│               └── lodash.min.js
├── build（webpack预处理配置文件）
│   ├── build.js
│   ├── check-versions.js
│   ├── config
│   │   ├── dev.env.js
│   │   ├── index.js
│   │   ├── index.tpl
│   │   ├── prod.env.js
│   │   └── test.env.js
│   ├── cooking.conf.js
│   ├── utils.js
│   ├── vue-loader.conf.js
│   ├── webpack.base.conf.js
│   ├── webpack.dev.conf.js
│   └── webpack.prod.conf.js
├── element-ui（独立的git项目，地址：http://gitlab.puhuitech.cn/paas-fe/element-ui，作为该git项目的submodule）
├── dist（预处理输出目录，改文件夹下的内容会打到@paas/fe-paas包）
│   └── package.json（发包配置文件，发包指令：npm publish）
├── package.json
└── yarn.lock
```


# Vue原型扩展

     Vue.prototype.$msgbox = MessageBox;
     Vue.prototype.$alert = MessageBox.alert;
     Vue.prototype.$confirm = MessageBox.confirm;
     Vue.prototype.$prompt = MessageBox.prompt;
     Vue.prototype.$notify = Notification;
     Vue.prototype.$message = Message;
     
     Vue.prototype.$url
     

# 通用样式类

`/fe-paas/app-galaxy/assets/css/common.scss`

## 空白补间类 

> 主要控制`盒子模型`的内外边距，用于局部空白调整

### 内边距：

类名命名规则 `padding`的首字母`p` + (`all,left,right,top,bottom`) 的首字母 (`a,l,r,t,b`) 组合, 其中 `x` 为水平方向左和右， `y` 为垂直方向上和下, (0,1,2,3,4,5) 表示像素 (0px,4px, 8px, 16px, 24px, 48px)

```
.pa-0,.pa-1,.pa-2,.pa-3,.pa-4,.pa-5
.pt-0,.pt-1,.pt-2,.pt-3,.pt-4,.pt-5
.pb-0,.pb-1,.pb-2,.pb-3,.pb-4,.pb-5,
.pl-0,.pl-1,.pl-2,.pl-3,.pl-4,.pl-5,
.pr-0,.pr-1,.pr-2,.pr-3,.pr-4,.pr-5,
.px-0,.px-1,.px-2,.px-3,.px-4,.px-5,
.py-0,.py-1,.py-2,.py-3,.py-4,.py-5,
```

### 外边距 

类名命名规则 取`margin`的首字母 `m`, 以及 (`left,right,top,bottom`) 的首字母 (`l,r,t,b`) 组合, 其中 x 为水平方向左和右， y 为垂直方向上和下, (0,1,2,3,4,5) 表示像素 (0px,4px, 8px, 16px, 24px, 48px)


```
.mt-0,.mt-1,.mt-2,.mt-3,.mt-4,.mt-5,
.mb-0,.mb-1,.mb-2,.mb-3,.mb-4,.mb-5,
.ml-0,.ml-1,.ml-2,.ml-3,.ml-4,.ml-5,
.mr-0,.mr-1,.mr-2,.mr-3,.mr-4,.mr-5,
.mx-0,.mx-1,.mx-2,.mx-3,.mx-4,.mx-5,
.my-0,.my-1,.my-2,.my-3,.my-4,.my-5,
```

```css

/* space补件 */

.mx-auto {
  margin-left: auto !important;
  margin-right: auto !important;
}

@each $level,$space in (0, 0),(1, 4),(2, 8)(3, 16),(4, 24),(5, 48) {

  .pa-#{$level} {
    padding: #{$space}px !important;
  }
  .pt-#{$level} {
    padding-top: #{$space}px !important;
  }
  .pb-#{$level} {
    padding-bottom: #{$space}px !important;
  }
  .pl-#{$level} {
    padding-left: #{$space}px !important;
  }
  .pr-#{$level} {
    padding-right: #{$space}px !important;
  }
  .px-#{$level} {
    padding-left: #{$space}px !important;
    padding-right: #{$space}px !important;
  }
  .py-#{$level} {
    padding-top: #{$space}px !important;
    padding-bottom: #{$space}px !important;
  }
  .mt-#{$level} {
    margin-top: #{$space}px !important;
  }
  .mb-#{$level} {
    margin-bottom: #{$space}px !important;
  }
  .ml-#{$level} {
    margin-left: #{$space}px !important;
  }
  .mr-#{$level} {
    margin-right: #{$space}px !important;
  }
  .mx-#{$level} {
    margin-left: #{$space}px !important;
    margin-right: #{$space}px !important;
  }
  .my-#{$level} {
    margin-top: #{$space}px !important;
    margin-bottom: #{$space}px !important;
  }
}

```
