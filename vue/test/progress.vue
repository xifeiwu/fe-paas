<template>
    <div>
        <input v-model="thePercent">
        <p>{{thePercent}}</p>
        <el-progress :percentage="0"></el-progress>
        <el-progress :percentage="thePercent" type="circle" class="the_demo"></el-progress>
        <el-progress :percentage="100" status="success"></el-progress>
        <el-progress :percentage="50" status="exception"></el-progress>
    </div>
</template>

<script>
    import Vue from 'vue';
    import Progress from '../packages/progress/index.js';
    Vue.component(Progress.name, Progress);
    export default {
        name: 'progress_demo',
        data() {
            return {
                thePercent: 50
            }
        },
        methods: {
            startAnimation() {
                var theDemo = document.querySelector('.the_demo');
                console.log(theDemo.percentage);
                var interTag = setInterval(function () {
                    console.log('here');
                }, 100);
            }
        }
    }
</script>
