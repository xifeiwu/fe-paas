<template>
  <div>
    <el-row>
      <el-col :span="6">
        <el-button>创建应用</el-button>
      </el-col>
      <el-col :span="6">
        <el-button>刷新</el-button>
      </el-col>
      <el-col :span="6"></el-col>
      <el-col :span="6">
        <el-select v-model="currentGroupWatcher" placeholder="请选择" @input="handleGroupChange">
          <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-table :data="appList" style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="商品名称">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="所属店铺">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="商品 ID">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="店铺 ID">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="商品分类">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="店铺地址">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
            <el-form-item label="商品描述">
              <span>{{ props.row.groupTag }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="应用名称" prop="groupTag">
      </el-table-column>
      <el-table-column label="创建者" prop="creator">
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime">
      </el-table-column>
      <el-table-column label="运行环境" prop="spaceList">
      </el-table-column>
    </el-table>
  </div>
</template>
<style>
  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
<script>
  export default {
    created() {
      this.$store.dispatch('user/getGroupList');
    },
    mounted() {
      console.log('mount app manager');
    },
    data() {
      return {
        currentGroup: '',
        appList: [],
        tableData5: [{
          id: '12987122',
          name: '好滋好味鸡蛋仔',
          category: '江浙小吃、小吃零食',
          desc: '荷兰优质淡奶，奶香浓而不腻',
          address: '上海市普陀区真北路',
          shop: '王小虎夫妻店',
          shopId: '10333'
        }, {
          id: '12987123',
          name: '好滋好味鸡蛋仔',
          category: '江浙小吃、小吃零食',
          desc: '荷兰优质淡奶，奶香浓而不腻',
          address: '上海市普陀区真北路',
          shop: '王小虎夫妻店',
          shopId: '10333'
        }, {
          id: '12987125',
          name: '好滋好味鸡蛋仔',
          category: '江浙小吃、小吃零食',
          desc: '荷兰优质淡奶，奶香浓而不腻',
          address: '上海市普陀区真北路',
          shop: '王小虎夫妻店',
          shopId: '10333'
        }, {
          id: '12987126',
          name: '好滋好味鸡蛋仔',
          category: '江浙小吃、小吃零食',
          desc: '荷兰优质淡奶，奶香浓而不腻',
          address: '上海市普陀区真北路',
          shop: '王小虎夫妻店',
          shopId: '10333'
        }]
      }
    },
    computed: {
      currentGroupWatcher: {
        get() {
          let value = this.currentGroup;
          if (0 === value.length) {
            let groupList = this.groupList;
            if (Array.isArray(groupList) && groupList.length > 0) {
              value = groupList[0].name;
            }
          }
          return value;
        },
        set(value) {
          this.currentGroup = value;
        }
      },
      groupList() {
        return this.$store.getters['user/groupList'];
      }
    },
    methods: {
      requestAPPList(groupID, page, length, serviceName) {
        if (!serviceName) {
          serviceName = '';
        }
        this.$net.getAPPList({
          groupId: groupID,
          page: page,
          length: length,
          serviceName: serviceName
        }).then(content => {
          console.log(content);
          if (content.hasOwnProperty('appList')) {
            this.appList = content.appList;
          }
        });
      },
      handleGroupChange: function(groupID) {
        this.requestAPPList(groupID, 1, 8, '');
      },
    }
  }
</script>