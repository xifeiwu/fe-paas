<template>
    <div>
        <div>
            <el-switch
            v-model="value2"
            active-color="#13ce66"
            inactive-color="#ff4949">
            </el-switch>
        </div>

        <div>
            <el-switch
                    v-model="value3"
                    name="付费规则"
                    active-text="按月付费"
                    inactive-text="按年付费">
            </el-switch>
        </div>

        <div>
            <el-switch
            style="display: block"
            v-model="value4"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="按月付费"
            inactive-text="按年付费">
            </el-switch>
        </div>
    </div>
</template>


<script>
    import Vue from 'vue';
    import Switch from '../packages/switch/index.js';
//    Vue.component(Switch.name, Switch);
    Switch.install(Vue);
    export default {
        data() {
            return {
                value1: true,
                value2: true,
                value3: true,
                value4: true,
            }
        }
    };
</script>