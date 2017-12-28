<template>
  <div>
    <el-button type="text" @click="open4">点击打开 Message Box</el-button>
    <el-button type="text" @click="open5">点击打开 Message Box</el-button>
  </div>
</template>

<script>
  export default {
    methods: {
      open4() {
        const h = this.$createElement;
        this.$msgbox({
          title: '消息',
//          message: h('p', null, [
//            h('span', null, '内容可以是 '),
//            h('i', { style: 'color: teal' }, 'VNode')
//          ]),
          message: `
          <el-tag>thi is tag</el-tag>
          `,
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true;
              instance.confirmButtonText = '执行中...';
              setTimeout(() => {
                done();
                setTimeout(() => {
                  instance.confirmButtonLoading = false;
                }, 300);
              }, 3000);
            } else {
              done();
            }
          }
        }).then(action => {
          this.$message({
            type: 'info',
            message: 'action: ' + action
          });
        });
      },
      open5() {
        this.$alert('<strong>这是 <i>HTML</i> 片段</strong>', 'HTML 片段', {
          dangerouslyUseHTMLString: true
        });
      },
    }
  }
</script>