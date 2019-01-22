const home = {
  state: {
    scrollTop: 0
  },
  mutations: {
    UPDATE_SCROLLTOP: (state, scrollTop) => {
      state.scrollTop = scrollTop
    }
  },
  actions: {
    UpdateScrollTop ({ commit }, scrollTop) {
      commit('UPDATE_SCROLLTOP', scrollTop)
    }
  }
}

export default home
