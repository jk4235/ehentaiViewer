const bookInfo = {
  state: {
    detailLink: '',
    totalPages: 0,
    cover: '',
    title: '',
    type: '',
    rate: 0,
    uploader: '',
    uploadTime: '',
    language: '',
    fileSize: '',
    length: '',
    favoriteCount: '0',
    isFavourite: false,
    cache: [],
    download: []
  },
  mutations: {
    UPDATE_BOOK_INFO: (state, bookInfo) => {
      Object.assign(state, bookInfo)
    },
    CLEAR_BOOK_INFO: (state) => {
      state = {
        detailLink: '',
        cover: '',
        title: '',
        type: '',
        rate: 0,
        uploader: '',
        uploadTime: '',
        language: '',
        fileSize: '',
        length: '',
        favoriteCount: '0',
        isFavourite: false,
        cache: [],
        download: []
      }
    }
  },
  actions: {
    UpdateBookInfo ({ commit }, bookInfo) {
      commit('UPDATE_BOOK_INFO', bookInfo)
    },
    ClearBookInfo ({ commit }) {
      commit('CLEAR_BOOK_INFO')
    }
  }
}

export default bookInfo
