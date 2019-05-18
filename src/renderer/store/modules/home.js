const home = {
  state: {
    scrollTop: 0
  },
  mutations: {
    UPDATE_SCROLL_TOP: (state, scrollTop) => {
      state.scrollTop = scrollTop
    }
  },
  actions: {
    UpdateScrollTop ({ commit }, scrollTop) {
      commit('UPDATE_SCROLL_TOP', scrollTop)
    }
  }
}

export default home
