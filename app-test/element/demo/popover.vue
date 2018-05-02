<template>
  <div>
    <el-popover
            ref="popover1"
            placement="top-start"
            title="标题"
            width="200"
            trigger="hover"
            content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">
    </el-popover>

    <el-popover
            ref="popover2"
            placement="bottom"
            title="标题"
            width="200"
            trigger="click"
            content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">
      <p>We will show what you want.</p>
    </el-popover>

    <el-button v-popover:popover1>hover 激活</el-button>
    <el-button v-popover:popover2>click 激活</el-button>
    <el-popover
            placement="right"
            title="标题"
            width="200"
            trigger="focus"
            content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">
      <el-button slot="reference">focus 激活</el-button>
    </el-popover>

    <el-popover
            placement="bottom"
            trigger="click"
            @after-leave="popperHandler('after-leave')"
            @show="popperHandler('show')"
            :disabled="disablePopper"
            popperClass="el-popover--small"
            content="复制成功">
      <el-button slot="reference" @click="handleButtonClick('copy', true)">复制</el-button>
    </el-popover>

    <el-popover
            width="160"
            v-model="visible2"
            placement="bottom"
            trigger="click"
            @after-leave="popperHandler('after-leave')"
            @show="popperHandler('show')"
            :disabled="disablePopper"
            popperClass="el-popover--small"
            content="复制成功">
      <p style="color: #fa5555">这是一段内容这是一段内容确定删除吗？</p>
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="visible2 = false">取消</el-button>
        <el-button type="danger" size="mini" @click="visible2 = false">确定</el-button>
      </div>
      <el-button slot="reference" @click="handleButtonClick('delete')">删除</el-button>
    </el-popover>
  </div>
</template>
<script>
  module.exports = {
    name: 'popover_demo',
    data() {
      return {
        disablePopper: false,
        visible2: false,
      }
    },
    methods: {
      popperHandler(action) {
        console.log(`popperHandler: ${action}`);
      },
      handleButtonClick(action, value) {
        switch (action) {
          case 'copy':
            if (value) {
              this.disablePopper = false;
              setTimeout(() => {
                this.disablePopper = true;
              }, 3000);
            } else {
              this.disablePopper = true;
            }
            break;
        }
      }
    }
  }
</script>