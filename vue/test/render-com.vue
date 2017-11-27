<template>
    <div>
        <render-com content="Hello render demo!">
            <span>这是一个render demo</span>
        </render-com>
    </div>
</template>

<script>
    import Vue from 'vue';
    import RenderCom from '../packages/render-com/index.js';
    RenderCom.install(Vue);
    export default {
        name: 'render_com_demo',
        methods: {
            hello() {
                alert('Hello World!');
            }
        }
    }

</script>