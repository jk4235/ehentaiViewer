const sidebar = {
  state: {
    opened: false
  },
  mutations: {
    TOGGLE_OPENED: (state) => {
      state.opened = !state.opened
    },
    CLOSE_SIDEBAR: (state) => {
      state.opened = false
    }
  },
  actions: {
    ToggleSideBar ({ commit }) {
      commit('TOGGLE_OPENED')
    },
    CloseSideBar ({ commit }) {
      commit('CLOSE_SIDEBAR')
    }
  }
}

export default sidebar
