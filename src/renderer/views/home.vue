<template>
  <el-container>
    <el-header style="height: 120px; width: 485px">
      <div class="typeSelect">
        <el-tag
          v-for="(v, k) in types"
          :key="k"
          @click.native="toggleSelect(k)"
          :type="v.on ? 'default' : 'info'"
        >
          {{ k }}
        </el-tag>
      </div>
      <el-row type="flex" justify="space-between">
        <el-col :span="17">
          <div>
            <el-input
              placeholder="Search Keywords"
              @keyup.enter.native="searchBooks(true)"
              v-model="searchKeyWords"
            ></el-input>
          </div>
        </el-col>
        <el-col :span="6">
          <div style="display: flex; justify-content: space-between">
            <el-button
              class="searchBtn"
              type="primary"
              @click="searchBooks(true)"
            >
              搜索
            </el-button>
            <el-button class="searchBtn" type="danger" @click="init">
              清除
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-scrollbar :native="false" ref="mainScrollbar" style="height: 700px">
      <el-main style="padding-top: 0; min-height: 680px" v-loading="loading">
        <el-card
          shadow="hover"
          v-for="(book, index) in books"
          :key="book.cover + index"
          @click.native="handleClick(book)"
        >
          <div class="cover"><img v-lazy="book.cover" /></div>
          <div class="bookInfo">
            <div class="bookTitle">{{ book.title }}</div>
            <div class="uploader">{{ book.uploader }}</div>
            <div class="rate">
              <el-rate
                v-model="book.rate"
                disabled
                text-color="#ff9900"
              ></el-rate>
            </div>
            <div class="type">
              <el-tag>{{ book.type.toUpperCase() }}</el-tag>
              <span class="uploadTime">
                {{ `${book.uploadTime} ${book.totalPages}` }}
              </span>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-scrollbar>
    <div class="jumper" tabindex="0">
      <el-input
        @change="jumpPage"
        :disabled="loading"
        :value="showPage"
        @input="handleInput"
        type="number"
        :max="totalResultPages"
        :min="1"
      >
        <template slot="append">{{ `/${totalResultPages}` }}</template>
      </el-input>
    </div>
  </el-container>
</template>

<script>
import { getListData } from '../api/ehentai'
import { HomeHtmlParser } from '../utils/parseHtml'
import { dbUpdate } from '@/utils/dbOperate'

export default {
  name: 'home',
  data() {
    return {
      types: {
        DOUJINSHI: {
          value: 2,
          on: 1
        },
        MANGA: {
          value: Math.pow(2, 2),
          on: 1
        },
        'ARTIST CG': {
          value: Math.pow(2, 3),
          on: 0
        },
        'GAME CG': {
          value: Math.pow(2, 4),
          on: 0
        },
        WESTERN: {
          value: Math.pow(2, 5),
          on: 0
        },
        COSPLAY: {
          value: Math.pow(2, 6),
          on: 0
        },
        'IMAGE SET': {
          value: Math.pow(2, 7),
          on: 0
        },
        'NON-H': {
          value: Math.pow(2, 8),
          on: 0
        },
        'ASIAN PORN': {
          value: Math.pow(2, 9),
          on: 0
        },
        MISC: {
          value: Math.pow(2, 10),
          on: 0
        }
      },
      books: [],
      searchKeyWords: 'chinese',
      loading: false,
      scrollBar: null,
      currentPage: 0,
      startPage: 0,
      parser: new HomeHtmlParser(),
      totalResultPages: 0
    }
  },
  computed: {
    showPage() {
      return this.currentPage + 1
    }
  },
  methods: {
    init() {
      for (const k in this.types) {
        if (k === 'DOUJINSHI' || k === 'MANGA') {
          this.types[k].on = 1
        } else {
          this.types[k].on = 0
        }
      }
      this.currentPage = 0
      this.startPage = 0
      this.searchKeyWords = 'chinese'
      this.books = []
      this.searchBooks()
    },
    parseHtml(html, isBefore) {
      const { books, totalResultPages } = this.parser.parseHtml(html)
      this.totalResultPages = totalResultPages
      if (isBefore) {
        this.books.unshift(...books)
      } else {
        this.books.push(...books)
      }
    },
    handleInput(value) {
      if (!value || parseInt(value) === 0) {
        this.currentPage = 0
      } else if (parseInt(value) > this.totalResultPages) {
        this.currentPage = this.totalResultPages - 1
      } else {
        this.currentPage = parseInt(value) - 1
      }
    },
    jumpPage() {
      this.books = []
      this.startPage = this.currentPage
      this.searchBooks()
    },
    toggleSelect(k) {
      this.types[k].on = this.types[k].on ? 0 : 1
    },
    async searchBooks(isInit = false, isBefore = false) {
      this.loading = true
      if (isInit) {
        this.books = []
        this.startPage = 0
        this.currentPage = 0
      }
      const queryParams = this.buildSearchParams()
      try {
        const res = await getListData(queryParams)
        this.parseHtml(res, isBefore)
        this.loading = false
      } catch (e) {
        this.loading = false
        throw e
      }
    },
    buildSearchParams() {
      const queryValue = Object.entries(this.types)
        .filter(cv => cv[1].on)
        .reduce((prev, curr) => {
          prev -= curr[1].value
          return prev
        }, 1023)
      const queryParams = [['f_cats', queryValue]]
      if (this.searchKeyWords) {
        this.searchKeyWords = this.searchKeyWords.trim().replace(/\s+/g, ' ')
        queryParams.push(['f_search', this.searchKeyWords])
      } else {
        queryParams.push(['f_search', ''])
      }
      queryParams.push(['f_apply', 'Apply Filter'])
      if (this.currentPage !== 0) {
        queryParams.push(['page', this.currentPage])
      }
      return queryParams.reduce((prev, curr) => {
        prev[curr[0]] = curr[1]
        return prev
      }, {})
    },
    async handleScroll() {
      if (this.loading) return
      let isScollToBottom = false
      let isScollToTop = false
      const { scrollHeight, scrollTop, clientHeight } = this.scrollBar
      this.currentPage =
        this.startPage +
        Math.floor(Math.floor(scrollTop + 800 - 1) / (189 * 25))
      isScollToTop = scrollTop === 0
      isScollToBottom = scrollHeight - scrollTop <= clientHeight
      if (isScollToBottom) {
        try {
          this.currentPage++
          await this.searchBooks()
        } catch (error) {
          this.currentPage--
        }
      }
      if (isScollToTop) {
        if (this.currentPage === 0) return
        try {
          this.currentPage--
          this.startPage--
          await this.searchBooks(false, true)
        } catch (error) {
          this.currentPage++
          this.startPage++
        }
      }
      this.$refs.mainScrollbar.update()
      if (isScollToTop) {
        await this.$nextTick()
        this.scrollBar.scrollTo(0, 189 * 24)
      }
    },
    handleClick(book) {
      this.$db.findOne(
        {
          detailLink: book.detailLink
        },
        (e, doc) => {
          if (!doc) {
            book.isFavourite = false
            this.$store.dispatchPromise('UpdateBookInfo', book).then(() => {
              dbUpdate(this.$store.state.bookInfo)
            })
          } else {
            book.isFavourite = !!doc.isFavourite
            this.$store.dispatchPromise('UpdateBookInfo', doc).then(() => {
              dbUpdate(this.$store.state.bookInfo)
            })
          }
          this.$router.push(`/gallery/index?link=${book.detailLink}`)
        }
      )
    }
  },
  mounted() {
    this.init()
    this.scrollBar = this.$refs.mainScrollbar.$el.querySelector(
      '.el-scrollbar__wrap'
    )
    this.scrollBar.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    this.scrollBar.removeEventListener('scroll', this.handleScroll)
  },
  beforeRouteLeave(to, from, next) {
    this.$store.dispatch('UpdateScrollTop', this.scrollBar.scrollTop)
    next()
  },
  activated() {
    this.$store.dispatch('ClearBookInfo')
    this.scrollBar.scrollTo(0, this.$store.state.home.scrollTop)
  }
}
</script>

<style scoped>
.typeSelect {
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: space-around;
  height: 75px;
}

.searchBtn {
  padding: 10px;
}

.el-card {
  display: flex;
  justify-items: center;
  margin: 5px 0 5px 0;
}

.cover {
  border: 2px solid;
  height: 133px;
  width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  float: left;
}

.cover > img {
  width: 100%;
  max-height: 100%;
}

.bookInfo {
  display: flex;
  flex-direction: column;
  height: 133px;
  margin-left: 120px;
}

.bookTitle {
  ext-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #303133;
}

.uploader {
  color: #909399;
  margin-top: 5px;
}

.uploadTime {
  color: #909399;
  float: right;
  font-size: 14px;
}

.type {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.rate {
  margin-top: 5px;
  flex-grow: 2;
}
.jumper {
  position: fixed;
  bottom: 50px;
  right: 10px;
  transition: all 0.2s;
  opacity: 0.5;
  outline: 0;
}
.jumper >>> input {
  width: 100px;
}

.jumper:focus,
.jumper:active,
.jumper:hover {
  opacity: 1;
}
</style>
