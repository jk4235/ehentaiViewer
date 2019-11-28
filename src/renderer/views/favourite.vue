<template>
  <div style="height: 100%">
    <h4 style="text-align: center">{{ title }}</h4>
    <el-scrollbar ref="mainScrollbar" style="height: 775px">
      <el-card
        shadow="hover"
        v-for="(book, index) in books"
        :key="book.cover + index"
        @click.native="handleClick(book)"
      >
        <div class="cover"><img :src="book.cover" /></div>
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
            <el-tag>
              {{ book.type ? book.type.toUpperCase() : 'UNKNOWN' }}
            </el-tag>
            <span class="uploadTime">
              {{ `${book.uploadTime} ${book.totalPages}` }}
            </span>
          </div>
        </div>
      </el-card>
    </el-scrollbar>
  </div>
</template>

<script>
import { dbUpdate } from '@/utils/dbOperate'
export default {
  name: 'favourite',
  props: {
    type: {
      type: String,
      default: 'favourite'
    }
  },
  data() {
    return {
      books: [],
      scrollBar: null,
      pageSize: 20,
      currentPage: 0,
      sortRule: { readTime: -1 }
    }
  },
  computed: {
    title: function() {
      switch (this.type) {
        default:
        case 'favourite':
          return '我的收藏'
        case 'history':
          return '浏览历史'
      }
    }
  },
  methods: {
    handleClick(book) {
      this.$store.dispatchPromise('UpdateBookInfo', book).then(() => {
        dbUpdate(this.$store.state.bookInfo)
      })
      this.$router.push(`/gallery/index?link=${book.detailLink}`)
    },
    searchBooks() {
      let condition = {}
      switch (this.type) {
        default:
        case 'favourite':
          condition = { isFavourite: true }
          break
        case 'history':
          condition = { isFavourite: { $exists: true } }
          break
      }
      this.$db
        .find(condition)
        .sort(this.sortRule)
        .skip(this.pageSize * this.currentPage)
        .limit(this.pageSize)
        .exec((e, docs) => {
          if (docs) {
            this.books.push(...docs)
          }
        })
    },
    handleScroll() {
      let isScollToBottom = false
      const { scrollHeight, scrollTop, clientHeight } = this.scrollBar
      isScollToBottom = scrollHeight - scrollTop <= clientHeight
      if (isScollToBottom) {
        this.currentPage++
        this.searchBooks()
        this.$refs.mainScrollbar.update()
      }
    }
  },
  mounted() {
    this.scrollBar = this.$refs.mainScrollbar.$el.querySelector(
      '.el-scrollbar__wrap'
    )
    this.scrollBar.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    this.scrollBar.removeEventListener('scroll', this.handleScroll)
  },
  beforeRouteLeave(to, from, next) {
    this.$store.dispatch('UpdateFScrollTop', this.scrollBar.scrollTop)
    next()
  },
  activated() {
    this.$store.dispatchPromise('ClearBookInfo')
    this.scrollBar.scrollTo(0, this.$store.state.favourite.scrollTop)
  },
  watch: {
    type: {
      handler: function() {
        this.books = []
        this.currentPage = 0
        this.searchBooks()
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
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
