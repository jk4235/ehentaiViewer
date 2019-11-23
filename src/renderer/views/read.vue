<template>
  <div>
    <div style="position: absolute; top: 5vh; right: 10vw;z-index: 10">
      <i
        v-for="(slide, index) in virtualData.slides"
        :class="getLoadIconClass(slide)"
        :key="slide.index"
        :style="getLoadIconStyle(slide.status, index)"
      ></i>
    </div>
    <swiper :options="swiperOption" ref="mySwiper">
      <swiper-slide
        v-for="(slide, index) in virtualData.slides"
        :key="index"
        :style="imgContainerStyle"
        class="imgContainer"
      >
        <img
          :src="getPicUrl(slide)"
          class="page"
          :key="createUniqueString()"
          @load="picLoaded(slide)"
          @error="picLoadError(slide, $event)"
        />
      </swiper-slide>
      <div class="swiper-pagination" slot="pagination"></div>
      <div class="swiper-button-prev" slot="button-prev"></div>
      <div class="swiper-button-next" slot="button-next"></div>
    </swiper>
    <el-button
      v-if="isFullScreen"
      style="position: absolute; bottom: 5vh; z-index: 10; right: 5vw"
      @click="toggleFullScreen"
      ><i class="fa fa-compress"></i
    ></el-button>
  </div>
</template>

<script>
import 'swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import { ReadHtmlParser } from '../utils/parseHtml'
import { getHtml } from '../api/ehentai'
import path from 'path'
import {
  cachePic,
  isCacheExists,
  stopRequest,
  isDownloading
} from '@/utils/cachePic'
import { createUniqueString } from '@/utils/helper'
import { dbUpdate } from '@/utils/dbOperate'
import Event from '@/utils/EventEmitter'

export default {
  name: 'read',
  components: {
    swiper,
    swiperSlide
  },
  data() {
    const self = this
    return {
      currentPage: this.$route.query.currentPage || 0,
      total: this.$route.query.total || 0,
      startPage: this.$route.query.link,
      parser: new ReadHtmlParser(),
      virtualData: {},
      swiperOption: {
        pagination: {
          el: '.swiper-pagination',
          type: 'fraction'
        },
        keyboard: {
          enabled: true,
          onlyInViewport: false
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        virtual: {
          slides: (function() {
            const slides = []
            for (let i = 0; i < self.$route.query.total; i += 1) {
              slides.push({
                index: i,
                status: 'loading',
                url: ''
              })
            }
            return slides
          })(),
          addSlidesBefore: 5,
          addSlidesAfter: 5,
          renderExternal(data) {
            self.virtualData = data
          }
        }
      },
      picLink: [],
      nextPage: null,
      isLastPage: false,
      parseTask: null,
      contentHeight: this.$electron.remote.BrowserWindow.getAllWindows()[0].getContentSize()[1],
      event: new Event(),
      createUniqueString
    }
  },
  methods: {
    async getPageInfo(page = this.startPage) {
      const html = await getHtml(page)
      return this.parser.parseHtml(html, page)
    },
    getPicLink() {
      this.$db.findOne(
        { detailLink: this.currentBook.detailLink },
        (e, doc) => {
          this.picLink = (doc && doc.cache) || []
          this.event.emit('getPicLinkDone')
        }
      )
    },
    handlePageInfo(info) {
      const { index } = info
      this.$set(this.picLink, index, info)
      this.cachePicture({ index })
      return info
    },
    async handleNoCachePage(page) {
      const info = await this.getPageInfo(page)
      const { nextPage, isLastPage } = this.handlePageInfo(info)
      this.nextPage = nextPage
      this.isLastPage = isLastPage
      this.event.emit('startNext')
    },
    startPicSpider(page) {
      if (!page) page = this.startPage
      if (this.isLastPage) return false
      let doc = null
      let docs = []
      this.$db.find({ cache: { $exists: true } }, (e, res) => {
        if (e) {
          console.log(e)
        }
        docs = res
        if (docs.length > 0) {
          this.$db.findOne({ 'cache.currentPage': page }, (err, ret) => {
            if (err) {
              console.log(err)
            }
            doc = ret
            if (doc) {
              const { nextPage, isLastPage, index } = doc.cache.find(
                cv => cv.currentPage === page
              )
              this.nextPage = nextPage
              this.isLastPage = isLastPage
              this.cachePicture({ index })
              this.event && this.event.emit('startNext', true)
            } else {
              this.event && this.event.emit('noCacheFind', page)
            }
          })
        } else {
          this.event.emit('noCacheFind', page)
        }
      })
    },
    bindEvent() {
      this.event.once('getPicLinkDone', () => {
        this.startPicSpider(this.startPage)
      })
      this.event.on('noCacheFind', page => {
        this.handleNoCachePage(page)
      })
      this.event.on('startNext', useCache => {
        if (this.isLastPage) {
          return false
        }
        if (useCache) {
          this.startPicSpider(this.nextPage)
          return false
        }
        this.parseTask = window.setTimeout(() => {
          this.startPicSpider(this.nextPage)
        }, 3000)
      })
    },
    resize() {
      this.contentHeight = this.isFullScreen
        ? this.mainWindow.getContentSize()[1] + 51
        : this.mainWindow.getContentSize()[1]
      if (!this.swiper) return false
      this.swiper.update()
    },
    toggleFullScreen() {
      this.$store.dispatch('ToggleFullScreen')
    },
    leaveFullScreen() {
      this.$store.dispatch('CloseFullScreen')
    },
    async reloadPic() {
      const index = this.activeIndex
      if (!this.picLink[index]) {
        this.$message.error('还未解析到当前页面,请稍等')
        return false
      }
      this.virtualData.slides[this.currentVirtualDataIndex].status = 'loading'
      const info = await this.getPageInfo(this.picLink[index].reloadUrl)
      const filePath = path.resolve(
        this.$electron.remote.app.getPath('temp'),
        `./cache/${this.dirName}/${index}.jpg`
      )
      stopRequest(this.picLink[index].picLink, filePath)
      this.$set(this.picLink, index, info)
      this.cachePicture({ index })
    },
    picLoaded(item) {
      item.status = 'loaded'
    },
    picLoadError(item, e) {
      item.status = 'error'
    },
    getPicUrl(slide) {
      const filePath = path.resolve(
        this.$electron.remote.app.getPath('temp'),
        `./cache/${this.dirName}/${slide.index}.jpg`
      )
      const target = this.picLink[slide.index]
      if (target) {
        if (isDownloading(target.picLink) || !isCacheExists(filePath)) {
          slide.url = target.picLink
        } else {
          slide.url = filePath
        }
      } else {
        if (isCacheExists(filePath)) {
          slide.url = filePath
        }
      }
      return slide.url
    },
    cachePicture(slide) {
      const filePath = path.resolve(
        this.$electron.remote.app.getPath('temp'),
        `./cache/${this.dirName}/${slide.index}.jpg`
      )
      const dirname = path.resolve(
        this.$electron.remote.app.getPath('temp'),
        `./cache/${this.dirName}`
      )
      cachePic(this.picLink[slide.index].picLink, filePath, dirname)
    }
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.swiper
    },
    currentBook() {
      return this.$store.state.bookInfo
    },
    dirName() {
      return this.$store.state.bookInfo.detailLink.split('/').join('_')
    },
    showSlides() {
      return this.virtualData.slides
    },
    mainWindow() {
      return this.$electron.remote.BrowserWindow.getAllWindows()[0]
    },
    containerHeight() {
      return this.contentHeight - 51 - 16
    },
    imgContainerStyle() {
      return {
        left: `${this.virtualData.offset}px`,
        height: `${this.containerHeight}px`
      }
    },
    isFullScreen() {
      return this.$store.getters.fullScreen
    },
    activeIndex() {
      return this.swiper.activeIndex
    },
    currentVirtualDataIndex() {
      const dataLength = this.virtualData.slides.length
      const isArriveLast =
        this.virtualData.slides[dataLength - 1].index === Number(this.total) - 1
      if (isArriveLast && this.total >= 13) {
        return dataLength - (Number(this.total) - this.activeIndex)
      } else if (isArriveLast) {
        return this.activeIndex
      } else {
        return this.virtualData.slides.length - 7
      }
    },
    getLoadIconStyle() {
      return function(status, index) {
        const colorMap = {
          loading: '#409EFF',
          loaded: '#67C23A',
          error: '#F56C6C'
        }
        const isCurrent = index === this.currentVirtualDataIndex
        return {
          color: colorMap[status] || '#FFF',
          'font-size': isCurrent ? '20px' : '1em'
        }
      }
    },
    getLoadIconClass() {
      return function(slide) {
        const { status, index } = slide
        if (status === 'loading') {
          return 'fa fa-circle-o-notch fa-spin'
        } else if (status === 'loaded') {
          return 'fa fa-check'
        } else if (status === 'error' && !this.picLink[index]) {
          return 'fa fa-circle-o-notch fa-spin'
        } else {
          return 'fa fa-warning'
        }
      }
    }
  },
  created() {
    this.bindEvent()
    this.getPicLink()
    document.onkeyup = e => {
      const key = window.event.keyCode
      if (key === 27) {
        this.leaveFullScreen()
      } else if (key === 13 || key === 108) {
        this.reloadPic()
      }
    }
  },
  mounted() {
    this.mainWindow.on('resize', this.resize)
    this.mainWindow.on('enter-full-screen', this.resize)
    this.mainWindow.on('leave-full-screen', this.resize)
  },
  watch: {
    isFullScreen: {
      handler: function(newVal) {
        this.mainWindow.setFullScreen(newVal)
      }
    },
    showSlides: {
      handler: function(newVal) {
        newVal.forEach(cv => {
          if (cv.status === 'error' && !this.picLink[cv.index]) {
            cv.status = 'loading'
          }
        })
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    const data = Object.assign({}, this.currentBook, { cache: this.picLink })
    dbUpdate(data)
    next()
  },
  beforeDestroy() {
    this.event = null
    window.clearTimeout(this.parseTask)
    this.mainWindow.removeListener('resize', this.resize)
    this.mainWindow.removeListener('enter-full-screen', this.resize)
    this.mainWindow.removeListener('leave-full-screen', this.resize)
    document.onkeyup = () => null
  }
}
</script>

<style scoped>
.page {
  max-width: 100%;
  max-height: 100%;
}

.imgContainer {
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-container {
  background-color: black;
}
</style>
