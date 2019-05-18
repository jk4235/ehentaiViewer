<template>
  <div style="height: 100%">
    <h4 style="text-align: center">我的收藏</h4>
    <el-scrollbar
      :native="false"
      ref="mainScrollbar"
      style="height: 100%">
      <el-card shadow="hover" v-for="(book, index) in books" :key="book.cover + index"
               @click.native="handleClick(book)">
        <div class="cover"><img :src="book.cover"></div>
        <div class="bookInfo">
          <div class="bookTitle">{{ book.title }}</div>
          <div class="uploader">{{ book.uploader }}</div>
          <div class="rate">
            <el-rate
              v-model="book.rate"
              disabled
              text-color="#ff9900">
            </el-rate>
          </div>
          <div class="type">
            <el-tag>{{ book.type.toUpperCase() }}</el-tag>
            <span class="uploadTime">{{ book.uploadTime }}</span>
          </div>
        </div>
      </el-card>
    </el-scrollbar>
  </div>
</template>

<script>
  export default {
    name: 'favourite',
    data () {
      return {
        books: [],
        scrollBar: null
      }
    },
    methods: {
      handleClick (book) {
        this.$store.dispatchPromise('UpdateBookInfo', book)
        this.$router.push(`/gallery/index?link=${book.detailLink}`)
      }
    },
    mounted () {
      this.$db.find({isFavourite: true}, (e, docs) => {
        this.books = docs
      })
      this.scrollBar = this.$refs.mainScrollbar.$el.querySelector('.el-scrollbar__wrap')
    },
    beforeRouteLeave (to, from, next) {
      this.$store.dispatch('UpdateFScrollTop', this.scrollBar.scrollTop)
      next()
    },
    activated () {
      this.$store.dispatch('ClearBookInfo')
      this.$db.find({isFavourite: true}, (e, docs) => {
        this.books = docs
      })
      this.scrollBar.scrollTo(0, this.$store.state.favourite.scrollTop)
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
