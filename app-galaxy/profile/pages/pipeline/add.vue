<template>
  <div id="pipeline-add">
    <div class="sheet">
      <div class="steps" @click="handleClick($event, 'change-step')">
        <ul>
          <li class="step step1 active">步骤一</li>
          <li class="step step2 ">步骤二</li>
          <li class="step step3">步骤三</li>
        </ul>
      </div>
      <div class="section-config">
        <div class="step step1">
          <div class="title">
            步骤一
          </div>
          <div class="config">
            content of config
          </div>
        </div>
        <div class="step step2">
          <div class="title">
            步骤二
          </div>
          <div class="config">
            <pipeline-stage name="start" description="start"></pipeline-stage><!--
            --><pipeline-stage v-for="(item, index) in stages" :name="item.name" :index="item.index"
                            :description="item.description" :key="index"></pipeline-stage>
            <pipeline-stage name="end" description="end"></pipeline-stage>
          </div>
        </div>
        <div class="step step3">
          <div class="title">
            步骤三
          </div>
          <div class="config">
            content of config
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
  #pipeline-add {
    height: 100%;
    background-color: white;
    .sheet {
      position: relative;
      .steps {
        background-color: #eee;
        border: 1px solid #cccccc;
        border-bottom: none;
        padding-top: 5px;
        border-top-left-radius: 3px;
        border-top-right-radius: 3px;
        ul li.step {
          display: inline-block;
          padding: 7px 10px;
          margin-left: 10px;
          font-size: 13px;
          color: #999;
          cursor: pointer;
          &.active {
            background: #f9f9f9;
            color: #000;
            font-weight: bold;
            z-index: 2;
            border: 1px solid #cccccc;
            border-bottom: 1px solid #f9f9f9;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
          }
        }
      }
      .section-config {
        border: 1px solid #cccccc;
        border-bottom-left-radius: 3px;
        border-bottom-right-radius: 3px;
        padding: 10px;
        border-top: none;
        background: #f9f9f9;
        .step {
          margin-bottom: 10px;
          .title {
            /*margin: 30px 0px 5px -10px;*/
            font-size: 19px;
            padding: 10px 15px;
            border: none;
            border-top: 1px solid #ddd;
          }
          &.step1 {
            .title {
              border-top: none;
            }
          }
          &.step2 {
            .config {
              padding-left: 15px;
              padding-top: 30px;
            }
          }
          .config {
            border-left: 5px solid rgba(0, 0, 0, 0.1);
            padding-left: 5px;
          }
        }
      }
    }
  }
</style>
<script>
  import pipelineStage from './components/stage.vue';
  export default {
    components: {pipelineStage},
    created() {},
    mounted() {
      this.stepNodeList = [].slice.call(this.$el.querySelectorAll('.sheet .steps .step'));
//      console.log(this.stepNodeList);
    },
    data() {
      return {
        stages: [{
          name: 'step1',
          description: '打包制作镜像',
          index: 1
        }, {
          name: 'step2',
          description: '部署到测试环境',
          index: null,
        }, {
          name: 'step3',
          description: '单元测试',
          index: 3
        }]
      }
    },
    computed: {

    },
    methods: {
      handleClick(evt, action) {
        const target = evt.target;
        switch (action) {
          case 'change-step':
            this.stepNodeList.forEach(it => {
              if (it.contains(target)) {
                it.classList.add('active');
              } else {
                it.classList.remove('active');
              }
            });
            console.log(evt.target);
            break;
        }
      }
    }
  }
</script>