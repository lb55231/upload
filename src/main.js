import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import uploader from 'vue-simple-uploader'
// import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import api from './api/index';
import "video.js/dist/video-js.css"; // 引入video.js的css
import hls from "videojs-contrib-hls"; // 播放hls流需要的插件
Vue.use(hls);
Vue.prototype.api = api
Vue.use(uploader)
// Vue.use(Antd)
Vue.use(ElementUI);
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
