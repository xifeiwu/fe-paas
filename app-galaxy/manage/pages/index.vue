<template>
  <div id="manage" class="spa">
    <div class="header">
      <div class="item">
        <label>LOB:</label>
        <el-select filterable v-model="lobId" placeholder="请选择">
          <el-option v-for="(item, index) in lobList" :key="item.id" :label="item.lobName" :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="item">
        <label>团队名称:</label>
        <el-select filterable v-model="groupId" placeholder="请选择">
          <el-option v-for="(item, index) in groupList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="item key-word">
        <el-select filterable v-model="keyWordType" placeholder="请选择" class="key-word-type">
          <el-option v-for="(item, index) in keyWordTypeList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
        <el-input
                v-model="keyword"
                size="mini"
                style="max-width: 200px"
                placeholder="按关键字搜索外网二级域名">
        </el-input>
      </div>
      <div class="item">
        <el-button size="mini-extral" @click="handleClick('search')">搜索</el-button>
      </div>
    </div>
    <div class="detail-list">

    </div>
  </div>
</template>

<style lang="scss">
  .header {
    label {
      font-size: 14px;
    }
    .el-input {
      .el-input__inner {
        height: 24px;
      }
    }
  }
</style>
<style lang="scss" scoped>
  .header {
    display: flex;
    .item {
      display: inline-block;
      margin-right: 3px;
      &.key-word {
        display: flex;
        width: 300px;
      }
      .el-select {
        max-width: 190px;
        &.key-word-type {
          max-width: 100px;
        }
      }
    }
  }
</style>

<script>
  import {mapState} from "vuex";
  export default {
    created() {
      Promise.all([
        this.$net.requestPaasServer(this.$net.URL_LIST.lob_list),
        this.$net.requestPaasServer(this.$net.URL_LIST.user_group_list),
      ]).then(resContentList => {
        const lobList = resContentList[0]['lobList'];
        const groupList = resContentList[1]['groupList'];
        this.$store.dispatch('lobList', lobList);
        this.$store.dispatch('groupList', groupList);
        this.lobList = [{id: '', lobName: '全部'}].concat(lobList);
        this.groupList = [{id: '', name: '全部'}].concat(groupList);
//        console.log(resContentList);
      })

    },
    mounted() {

    },
    data() {
      return {
        lobId: '',
        groupId: '',
        keyword: '',
        keyWordType: 1,
        keyWordTypeList: [{
          id: 1,
          name: '应用名称'
        }, {
          id: 2,
          name: '项目名称'
        }],

        lobList: [],
        groupList: [],
      }
    },
    computed: {
//      ...mapState(['lobList', 'groupList'])
    },

    methods: {
      handleClick(action) {
        switch (action) {
          case 'search':
            const payload = {
              pageNum: 1,
              pageSize: 10,
              lobId: this.lobId,
              scrumId: this.groupId,
            };
            if (this.keyWordType === 1) {
              payload['appName'] = this.keyword;
            } else {
              payload['tag'] = this.keyword;
            }
            console.log(payload);
            break;
        }
      }
    }
  }
</script>