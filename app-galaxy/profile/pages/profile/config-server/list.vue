<template>
    <div>
        <div class="pa-3" style="background-color: #fff;">
            <el-row :gutter="20">
                <el-col :span="6">
                    <el-button type="success" icon="el-icon-circle-plus-outline" @click="openEditor()">
                        添加配置文件
                    </el-button>
                </el-col>
            </el-row>
        </div>
        <el-table :data="configFiles" max-height="650" stripe>
            <el-table-column prop="configFileName" label="文件名称">
                <template slot-scope="scope">
                    <el-button type="text" @click="openEditor(scope.row)">
                        <i class="el-icon-document"></i>
                        <span style="margin-left: 6px; font-weight: 800; ">
                            {{ scope.row.configFileName }}
                        </span>
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column prop="version" label="文件版本">
            </el-table-column>
            <el-table-column prop="updateTime" label="最后修改时间">
                <template slot-scope="scope">
                    <i class="el-icon-time"></i>
                    {{scope.row.updateTime || scope.row.createTime | localDate}}
                </template>
            </el-table-column>
        </el-table>

        <!-- editor -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogEditor" top="30px" width="90%" :fullscreen="false">
            <div class="py-3" style="width: 80%; text-align: left;">
                <el-input v-model="fileName" v-if="!fileName" placeholder="文件类型为： .properties 或 .yml">
                    <template slot="prepend">
                        <div>&emsp;文件名称：</div>
                    </template>
                </el-input>
                <h3 v-if="fileName">{{fileName}}</h3>
            </div>
            <div class="__editor">
                <codemirror v-model="code" :options="cmOptions"></codemirror>
                <!-- <MonacoEditor theme="vs-dark" :height="500" width="100%" language="yaml" :code="code" :editorOptions="options" @mounted="onMounted" @codeChange="onCodeChange"> -->
                <!-- </MonacoEditor> -->
            </div>
            <div slot="footer" class="pa-3 align-left">
                <el-button @click="dialogEditor = false">取 消</el-button>
                <el-button type="primary" @click="dialogEditor=false">保存</el-button>
            </div>
        </el-dialog>
    </div>

</template>

<script>
import { mapState } from "vuex";
// import MonacoEditor from "vue-monaco-editor";
import { codemirror } from "vue-codemirror";
import "codemirror/lib/codemirror.css";

// language
import "codemirror/mode/css/css.js";
// theme
import "codemirror/theme/monokai.css";
// require active-line.js
import "codemirror/addon/selection/active-line.js";

export default {
  components: {
    //   MonacoEditor,
    codemirror
  },
  data() {
    return {
      search: "",
      dialogEditor: false,
      code: "config.name=kaniu\nconfig.password=123456",
      options: {
        selectOnLineNumbers: true,
        fontSize: 14
      },
      fileName: "",
      dialogTitle: "创建",
      cmOptions: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: "text/css",
        theme: "monokai",
        readOnly: false,
        viewportMargin: 10
      }
    };
  },
  computed: {
    ...mapState("etc", ["configFiles"]),
  },
  filters: {
    localDate(val) {
      return new Date(val).toLocaleString();
    }
  },
  methods: {
    onMounted(editor) {
      this.editor = editor;
    },
    onCodeChange(editor) {
      console.log(editor.getValue());
    },
    openEditor(val) {
      this.fileName = val ? val.configFileName : "";
      this.dialogTitle = val ? "编辑配置文件" : "创建配置文件";
      this.dialogEditor = true;
    }
  }
};
</script>

<style>
.__editor {
  text-align: left;
  min-height: 400px;
}
.CodeMirror {
  min-height: 520px;
}
</style>

