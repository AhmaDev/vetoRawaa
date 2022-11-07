import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex)

export default new Vuex.Store({
  plugins:[createPersistedState()],
  state: {
    isLoggedIn: false,
    loginInfo: null,
  },
  mutations: {
    setLoginInfo: function(state, payload) {
      state.loginInfo = payload;
      state.isLoggedIn = true;
    },
  },
  actions: {
  },
  modules: {
  },
  getters: {
    isLoggedIn : state => state.isLoggedIn,
    getLoginInfo : state => state.loginInfo,
  }
})
