<template>
    <el-container>
        <el-header style="height: 120px; width: 485px">
            <div class="typeSelect">
                <el-tag
                    v-for="(v, k) in types"
                    :key="k"
                    @click.native="toggleSelect(k)"
                    :type="v ? 'default' : 'info'">{{ k }}</el-tag>
            </div>
            <el-row type="flex" justify="space-between">
                <el-col :span="17">
                    <div>
                        <el-input
                                placeholder="Search Keywords"
                                @keyup.enter.native="searchBooks(true)"
                                v-model="searchKeyWords"></el-input>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div style="display: flex; justify-content: space-between">
                        <el-button class="searchBtn" type="primary" @click="searchBooks(true)">搜索</el-button>
                        <el-button class="searchBtn" type="danger" @click="init">清除</el-button>
                    </div>
                </el-col>
            </el-row>
        </el-header>
        <el-scrollbar
                :native="false"
                ref="mainScrollbar"
                style="height: 700px">
        <el-main style="padding-top: 0; min-height: 680px" v-loading="loading">
            <el-card shadow="hover" v-for="book in books" :key="book.cover" @click.native="handleClick(book)">
                <div class="cover"><img :src="book.cover"></div>
                <div class="bookInfo">
                    <div class="bookTitle">{{ book.title }}</div>
                    <div class="uploader">{{ book.uploader }}</div>
                    <div class="rate"><el-rate
                            v-model="book.rate"
                            disabled
                            text-color="#ff9900">
                    </el-rate></div>
                    <div class="type">
                        <el-tag>{{ book.type.toUpperCase() }}</el-tag>
                        <span class="uploadTime">{{ book.uploadTime }}</span>
                    </div>
                </div>
            </el-card>
        </el-main>
        </el-scrollbar>
    </el-container>
</template>

<script>
import { getListData } from '../api/ehentai'
import cheerio from 'cheerio'

export default {
  name: 'home',
  data () {
    return {
      types: {
        'DOUJINSHI': 1,
        'MANGA': 1,
        'ARTIST CG': 0,
        'GAME CG': 0,
        'WESTERN': 0,
        'NON-H': 0,
        'IMAGE SET': 0,
        'COSPLAY': 0,
        'ASIAN PORN': 0,
        'MISC': 0
      },
      books: [],
      searchKeyWords: 'chinese',
      loading: false,
      scrollBar: null,
      currentPage: 1
    }
  },
  methods: {
    init () {
      for (const k in this.types) {
        if (k === 'DOUJINSHI' || k === 'MANGA') {
          this.types[k] = 1
        } else {
          this.types[k] = 0
        }
      }
      this.currentPage = 1
      this.searchKeyWords = 'chinese'
      this.books = []
      this.searchBooks()
    },
    parseHtml (html) {
      const $ = cheerio.load(html)
      $('tr[class="gtr0"], tr[class="gtr1"]').each((index, cv) => {
        const detailLink = $(cv).find('.it5 > a').prop('href').split('.org')[1]
        let cover = null
        let title = $(cv).find('.it5 > a').text()
        const coverEl = $(cv).find('.it2 img')
        if (coverEl.length) {
          cover = coverEl.prop('src')
        } else {
          cover = this.getCover($(cv).find('.it2').text())
        }
        const type = $(cv).find('.itdc img').prop('alt')
        const rate = this.countRate($(cv).find('.ir').attr('style'))
        const uploader = $(cv).find('.itu a').text()
        const uploadTime = $(cv).find('.itd').eq(0).text()
        this.books.push({
          detailLink,
          cover,
          title,
          type,
          rate,
          uploader,
          uploadTime
        })
      })
    },
    toggleSelect (k) {
      this.types[k] = this.types[k] ? 0 : 1
    },
    getCover (str) {
      const a = str.split('~', 4)
      return a[0] === 'init' ? `http://${a[1]}/${a[2]}` : `https://${a[1]}/${a[2]}`
    },
    countRate (rateStr) {
      let rate = 5
      const [num1, num2] = rateStr.split(';')[0].slice(20).split(' ').map(cv => cv.replace('px', ''))
      rate = rate + Number(num1) / 16
      if (num2 === '-21') {
        rate--
        rate += 0.5
      }
      return rate
    },
    searchBooks (isInit = false) {
      this.loading = true
      const queryParams = this.buildSearchParams()
      if (isInit) {
        this.books = []
        this.currentPage = 1
      }
      getListData(queryParams).then(res => {
        this.parseHtml(res)
      }).finally(() => { this.loading = false })
    },
    buildSearchParams () {
      const queryParams = Object.entries(this.types).map(cv => {
        cv[0] = `f_${cv[0].replace(/\s/g, '').toLowerCase()}`
        return cv
      })
      if (this.searchKeyWords) {
        this.searchKeyWords = this.searchKeyWords.trim().replace(/\s+/g, ' ')
        queryParams.push(['f_search', this.searchKeyWords])
      } else {
        queryParams.push(['f_search', ''])
      }
      queryParams.push(['f_apply', 'Apply Filter'])
      if (this.currentPage !== 1) {
        queryParams.push(['page', this.currentPage])
      }
      return queryParams.reduce((prev, curr) => {
        prev[curr[0]] = curr[1]
        return prev
      }, {})
    },
    handleScroll () {
      let isScollToBottom = false
      const { scrollHeight, scrollTop, clientHeight } = this.scrollBar
      isScollToBottom = scrollHeight - scrollTop === clientHeight
      if (isScollToBottom) {
        this.currentPage++
        this.searchBooks()
        this.$refs.mainScrollbar.update()
      }
    },
    handleClick (book) {
      this.$store.dispatch('UpdateBookInfo', book)
      this.$router.push('/gallery/index')
    }
  },
  mounted () {
    this.init()
    this.scrollBar = this.$refs.mainScrollbar.$el.querySelector('.el-scrollbar__wrap')
    this.scrollBar.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy () {
    this.scrollBar.removeEventListener('scroll', this.handleScroll)
  },
  beforeRouteLeave (to, from, next) {
    this.$store.dispatch('UpdateScrollTop', this.scrollBar.scrollTop)
    next()
  },
  activated () {
    this.scrollBar.scrollTo(0, this.$store.state.home.scrollTop)
  }
}
</script>
<style>
.el-scrollbar__wrap {
    overflow-x: hidden;
}
</style>

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
    border:2px solid;
    height:133px;
    width:100px;
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
</style>