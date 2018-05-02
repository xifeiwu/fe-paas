<template>
    <div>
        <!-- `checked` 为 true 或 false -->
        <div>
            <el-checkbox v-model="checked"
                         label="labelValue"
                         name="Are you OK?"
                         @change="checkboxChange"
            >备选项</el-checkbox>
        </div>
        <div>
        <el-checkbox-group @input="groupInput"
                           @change="groupChange"
                           :min="1"
                           v-model="checkList">
            <el-checkbox
                    label="复选框 A"
                    @change="checkboxChange">
            </el-checkbox>
            <el-checkbox label="复选框 B"></el-checkbox>
            <el-checkbox label="复选框 C"></el-checkbox>
            <el-checkbox label="禁用" disabled></el-checkbox>
            <el-checkbox label="选中且禁用" disabled></el-checkbox>
        </el-checkbox-group>
        </div>
    </div>

</template>
<script>
    export default {
        data() {
            return {
                checked: true,
                labelVlaue: "input框",
                checkList: ['选中且禁用','复选框 A']
            };
        },
        methods: {
            groupInput: function() {
//                console.log('groupInput');
//                console.log(arguments);
            },
            groupChange: function () {
//                console.log("groupChange");
//                console.log(arguments);
            },
            checkboxChange: function () {
//                console.log("checkboxChange");
//                console.log(arguments);
            }
        }
    };
</script>