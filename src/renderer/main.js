import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import db from './utils/database'

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import VueLazyload from 'vue-lazyload'

import 'font-awesome/scss/font-awesome.scss'
import '@/style/index.scss' // global css

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.prototype.$db = db
Vue.config.productionTip = false

Vue.use(Element, {
  size: 'medium'
})

Vue.use(VueLazyload, {
  preLoad: 1.3,
  attempt: 1
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
