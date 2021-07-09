import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    apiKeyId: '',
    apiKey: '',
    errorMessage: ''
  },
  mutations: {
    setApiKeyId (state, value) {
      state.apiKeyId = value
    },
    setApiKey (state, value) {
      state.apiKey = value
    },
    initError (state, value) {
      state.errorMessage = value
    }
  }
})
