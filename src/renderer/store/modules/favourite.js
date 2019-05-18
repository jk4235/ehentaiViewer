const favourite = {
  state: {
    scrollTop: 0
  },
  mutations: {
    UPDATE_F_SCROLL_TOP: (state, scrollTop) => {
      state.scrollTop = scrollTop
    }
  },
  actions: {
    UpdateFScrollTop ({ commit }, scrollTop) {
      commit('UPDATE_F_SCROLL_TOP', scrollTop)
    }
  }
}

export default favourite
