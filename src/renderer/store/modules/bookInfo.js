const bookInfo = {
  state: {
    detailLink: '',
    cover: '',
    title: '',
    type: '',
    rate: 0,
    uploader: '',
    uploadTime: ''
  },
  mutations: {
    UPDATE_BOOKINFO: (state, bookInfo) => {
      Object.assign(state, bookInfo)
    }
  },
  actions: {
    UpdateBookInfo ({ commit }, bookInfo) {
      commit('UPDATE_BOOKINFO', bookInfo)
    }
  }
}

export default bookInfo
