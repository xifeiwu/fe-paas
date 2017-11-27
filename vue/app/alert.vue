

<template>

<div>
    <el-alert title="不可关闭的 alert" type="success" :closable="false">
    </el-alert>
    <el-alert title="自定义 close-text" type="info" close-text="知道了">
    </el-alert>
    <el-alert title="设置了回调的 alert" type="warning" @close="hello">
    </el-alert>
</div>

</template>

<script>

import Vue from 'vue';
import Alert from '../packages/alert/index.js';
Vue.component(Alert.name, Alert);
export default {
    name: 'alert_demo',
    methods: {
        hello() {
            alert('Hello World!');
        }
    }
}

</script>
