const navbar = {
  state: {
    fullScreen: false
  },
  mutations: {
    TOGGLE_FULL_SCREEN: (state) => {
      state.fullScreen = !state.fullScreen
    },
    CLOSE_FULL_SCREEN: (state) => {
      state.fullScreen = false
    }
  },
  actions: {
    ToggleFullScreen ({ commit }) {
      commit('TOGGLE_FULL_SCREEN')
    },
    CloseFullScreen ({ commit }) {
      commit('CLOSE_FULL_SCREEN')
    }
  }
}

export default navbar
