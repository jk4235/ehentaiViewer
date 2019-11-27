import moment from 'moment'
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
    download: [],
    readTime: ''
  },
  mutations: {
    UPDATE_BOOK_INFO: (state, bookInfo) => {
      Object.assign(state, bookInfo, {
        readTime: moment().format('YYYY-MM-DD HH:mm:ss')
      })
    },
    CLEAR_BOOK_INFO: state => {
      const raw = {
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
        download: [],
        readTime: ''
      }
      Object.assign(state, raw)
    }
  },
  actions: {
    UpdateBookInfo({ commit }, bookInfo) {
      commit('UPDATE_BOOK_INFO', bookInfo)
    },
    ClearBookInfo({ commit }) {
      commit('CLEAR_BOOK_INFO')
    }
  }
}

export default bookInfo
