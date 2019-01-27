const navbar = {
  state: {
    fullScreen: false
  },
  mutations: {
    TOGGLE_FULLSCREEN: (state) => {
      state.fullScreen = !state.fullScreen
    },
    CLOSE_FULLSCREEN: (state) => {
      state.fullScreen = false
    }
  },
  actions: {
    ToggleFullScreen ({ commit }) {
      commit('TOGGLE_FULLSCREEN')
    },
    CloseFullScreen ({ commit }) {
      commit('CLOSE_FULLSCREEN')
    }
  }
}

export default navbar
