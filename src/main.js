import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import axios from 'axios'
import VueAxios from 'vue-axios'
import vueCustomElement from 'vue-custom-element'

Vue.use(Vuex)
Vue.use(VueAxios, axios)

import 'document-register-element/build/document-register-element'

Vue.use(vueCustomElement)
Vue.customElement('mea-easy-launch', App)
