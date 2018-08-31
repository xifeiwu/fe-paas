<template>
  <div id="page-not-found">
    <div class="main">
      <div class="code">404</div>
      <div class="text">page not found</div>
      <div class="navigate">
        <a href="/profile">控制台</a>
        <div class="ant-divider"></div>
        <a href="/docs">帮助文档</a>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  #page-not-found {
    height: 100%;
    .main {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .code {
        color: #E6A23C;
        font-size: 50px;
        font-weight: bold;
      }
      .text {
        color: #606266;
        font-size: 32px;
        font-weight: bold;
      }
      .navigate {
        margin-top: 20px;
      }
      .ant-divider {
        margin: 0 6px;
        display: inline-block;
        height: 12px;
        width: 1px;
        background: #ccc;
      }
    }
  }
</style>

