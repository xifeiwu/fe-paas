<template>
  <div>
    <div>
      <el-button>默认按钮</el-button>
      <el-button type="primary">主要按钮</el-button>
      <el-button type="success">成功按钮</el-button>
      <el-button type="info">信息按钮</el-button>
      <el-button type="warning">警告按钮</el-button>
      <el-button type="danger">危险按钮</el-button>
    </div>

    <div style="margin: 20px 0">
      <el-button plain>朴素按钮</el-button>
      <el-button type="primary" plain >主要按钮</el-button>
      <el-button type="success" plain>成功按钮</el-button>
      <el-button type="info" plain>信息按钮</el-button>
      <el-button type="warning" plain>警告按钮</el-button>
      <el-button type="danger" plain>危险按钮</el-button>
    </div>

    <div>
      <el-button round @click="handleClick">圆形按钮</el-button>
      <el-button type="primary" round disabled>主要按钮</el-button>
      <el-button type="success" round loading>成功按钮</el-button>
      <el-button type="info" round><div><div>请点击</div><div>信息按钮</div></div></el-button>
      <el-button type="warning" round>警告按钮</el-button>
      <el-button type="danger" round>危险按钮</el-button>
    </div>

    <div>
      <el-button type="primary" icon="el-icon-edit"></el-button>
      <el-button type="primary" icon="el-icon-share"></el-button>
      <el-button type="primary" icon="el-icon-delete"></el-button>
      <el-button type="primary" icon="el-icon-search">搜索</el-button>
      <el-button type="primary">上传<i class="el-icon-upload el-icon--right"></i></el-button>
    </div>
  </div>
</template>

<script>
  export default {
    methods: {
      handleClick() {
        console.log(arguments);
      }
    }
  }
</script>