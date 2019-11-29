<template>
  <el-scrollbar :native="false" style="height: 800px">
    <div>
      <h3 class="bookTitle">{{ bookInfo.title }}</h3>
      <div style="display: flex; flex-direction: row">
        <div class="cover">
          <img :src="bookInfo.cover" alt="cover" />
        </div>
        <div class="bookInfo" v-loading="detailLoading">
          <el-form label-position="left" label-width="8vh">
            <el-form-item label="Type">
              <el-tag>{{ bookInfo.type.toUpperCase() }}</el-tag>
            </el-form-item>
            <el-form-item label="Language">
              <span>{{ bookInfo.language }}</span>
            </el-form-item>
            <el-form-item label="Length">
              <span>{{ bookInfo.length }}</span>
            </el-form-item>
            <el-form-item label="Favorited">
              <span>
                {{ bookInfo.favoriteCount }}
                <i class="fa fa-heart" style="color: #F56C6C"></i>
              </span>
            </el-form-item>
            <el-form-item label="File Size">
              <span class="uploader">{{ bookInfo.fileSize }}</span>
            </el-form-item>
            <el-form-item label="Uploader">
              <span class="uploader">{{ bookInfo.uploader }}</span>
            </el-form-item>
            <el-form-item label="Posted">
              <span class="uploadTime">{{ bookInfo.uploadTime }}</span>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div
        class="rate"
        v-loading="detailLoading"
        style="display: flex; justify-content: center; margin-top: 10px; flex-direction: column"
      >
        <el-rate
          style="display: flex; justify-content: center"
          v-model="bookInfo.rate"
          disabled
          text-color="#ff9900"
        ></el-rate>
        <div style="display: flex; justify-content: center; margin-top: 5px">
          <span style="color: #ff9900">{{ rateText }}</span>
          <span>
            {{ `(${rateDetailInfo.average}, ${rateDetailInfo.peopleCount})` }}
          </span>
        </div>
      </div>
      <div style="margin-top: 10px">
        <el-button
          style="width: 100%"
          type="success"
          @click="readBook"
          :disabled="detailLoading"
        >
          阅读
        </el-button>
      </div>
      <div style="margin-top: 10px">
        <el-button
          style="width: 100%"
          type="primary"
          @click="toggleFavourite"
          :disabled="detailLoading"
        >
          <i
            v-if="bookInfo.isFavourite"
            class="fa fa-star"
            style="color: #ff9900"
          ></i>
          <i v-else class="fa fa-star-o"></i>
          收藏
        </el-button>
      </div>
      <div
        v-for="(tagGroup, index) in tagGroupList"
        class="groupContainer"
        :key="index"
      >
        <div class="groupName">
          <el-tag>{{ tagGroup.groupName }}</el-tag>
        </div>
        <div class="tags">
          <el-tag
            v-for="(tag, i) in tagGroup.tagList"
            type="success"
            class="tag"
            :key="i"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      <div class="commentContainer">
        <el-card class="comment" v-for="( comment, index) in commentList" :key="index" shadow="hover">
          <div>{{ comment.content }}</div>
          <div class="commentInfo">
            <span>{{ comment.author }}</span>
            <span>{{ comment.commentTime }}</span>
            <span v-if="comment.score">{{ parseInt(comment.score) >=0 ? '👍': '👎' }}</span>
            <span v-else>📢</span>
            <span>{{ comment.score }}</span>
          </div>
        </el-card>
      </div>
      <div>
        <el-button
          v-show="!detailLoading"
          type="text"
          style="width: 100%"
          @click="getAllComment"
          :disabled="!hasMore"
        >
          {{
          hasMore
          ? '加载全部评论'
          : '已加载全部评论'
          }}
        </el-button>
      </div>
      <div class="prevContainer">
        <div v-for="(item, index) in prevPics" :key="index" class="previewBox">
          <div :style="getPrevStyle(item)">
            <img src="@/assets/blank.gif" />
          </div>
        </div>
      </div>
      <div>
        <el-button
          v-show="!detailLoading"
          type="text"
          style="width: 100%"
          @click="getPrevPic"
          :disabled="prevPics.length === previewInfo.totalPages"
        >
          {{
            prevPics.length === previewInfo.totalPages
              ? '已加载全部预览图'
              : '加载更多预览图'
          }}
        </el-button>
      </div>
    </div>
  </el-scrollbar>
</template>

<script>
import { getHtml } from '../api/ehentai'
import { GalleryHtmlParser, CommentParser } from '../utils/parseHtml'
import { dbUpdate } from '@/utils/dbOperate'

export default {
  name: 'gallery',
  data() {
    return {
      rateTextList: [
        '当场去世',
        '我感觉很难受',
        '狗眼瞎了',
        '糟糕透顶',
        '不行',
        '一般般',
        '还行',
        '不错',
        '很棒',
        '好极了',
        '根本把持不住'
      ],
      detailLoading: false,
      rateDetailInfo: {
        peopleCount: 0,
        average: 0
      },
      tagGroupList: [],
      previewInfo: {
        totalPages: 0,
        prevInfo: []
      },
      currentPrev: 0,
      commentList: [],
      hasMore: false,
      parser: new GalleryHtmlParser(),
      commentParser: new CommentParser()
    }
  },
  computed: {
    bookInfo() {
      return this.$store.state.bookInfo
    },
    rateText() {
      let index = 0
      if (this.rateDetailInfo.average) {
        index = Math.floor(this.rateDetailInfo.average * 2)
      } else {
        index = this.bookInfo.rate === 0 ? 0 : this.bookInfo.rate * 2 - 1
      }
      return this.rateTextList[index]
    },
    prevPics() {
      const picList = []
      this.previewInfo.prevInfo.forEach(cv => {
        let bgPic = null
        let moveIndex = 0
        cv.previewPicLink.forEach((v, i) => {
          const { picLink } = v
          const currentBgPic = v.largePicUrl
          if (i !== 0 && currentBgPic !== bgPic) {
            if (bgPic) moveIndex = 0
            bgPic = currentBgPic
          }
          picList.push({
            picLink,
            currentBgPic,
            index: moveIndex
          })
          moveIndex++
        })
      })
      return picList
    }
  },
  methods: {
    async getGalleryInfo(link) {
      this.detailLoading = true
      const detailLink = link || this.$route.query.link
      const res = await getHtml(detailLink)
      this.handleHtmlParse(res)
      this.handleCommentParse(res)
    },
    async handleHtmlParse(res) {
      const val = this.parser.parseHtml(res)
      if (val.isPining) {
        await this.$alert('本内容只对高级用户开放,将退回首页', '提示', {
          confirmButtonText: '确定'
        })
        this.$router.push('/home')
      } else if (val.isOffensive) {
        const h = this.$createElement
        const vNode = h('div', {}, [
          h('p', {}, '可能包含令人不适的内容,是否继续?'),
          h(
            'el-checkbox',
            { ref: 'noMoreNotice', key: new Date().getTime() },
            '不再提醒'
          )
        ])
        try {
          await this.$confirm(vNode, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          const choice = this.$refs.noMoreNotice.isChecked
            ? 'ignoreLink'
            : 'viewLink'
          const html = await getHtml(val[choice])
          this.handleHtmlParse(html)
        } catch (e) {
          console.log(e)
          await this.$alert('解析网页发生错误,将返回首页', '错误', {
            confirmButtonText: '确定'
          })
          this.$router.push('/home')
        }
      } else {
        this.handleDetailData(val)
      }
    },
    handleCommentParse(res) {
      const { commentList, hasMore } = this.commentParser.parseHtml(res)
      this.commentList = commentList
      this.hasMore = hasMore
    },
    handleDetailData(data) {
      const { bookDetailInfo, rateDetailInfo, tagGroupInfo, previewInfo } = data
      this.$store.dispatch('UpdateBookInfo', bookDetailInfo)
      Object.assign(this.rateDetailInfo, rateDetailInfo)
      this.tagGroupList = tagGroupInfo
      this.previewInfo.totalPages = Number(previewInfo.totalPages)
      this.previewInfo.prevInfo.push(previewInfo.prevInfo)
      this.detailLoading = false
    },
    getPrevStyle(item) {
      return {
        margin: '1px auto 0',
        width: '100px',
        height: '142px',
        background: `transparent url(${item.currentBgPic}) -${item.index *
          100}px 0 no-repeat`
      }
    },
    readBook() {
      if (this.prevPics.length > 0) {
        this.$router.push(
          `/read/index?link=${this.prevPics[0].picLink}&total=${this.previewInfo.totalPages}&currentPage=0`
        )
      } else if (this.bookInfo.cache.length > 0) {
        this.$router.push(
          `/read/index?link=${this.bookInfo.cache[0].firstPage}&total=${
            this.bookInfo.totalPages.split(' ')[0]
          }&currentPage=0`
        )
      } else {
        this.$message.error('页面信息加载出错,请退出重新加载')
      }
    },
    getPrevPic() {
      const link = this.$route.query.link + `?p=${this.currentPrev + 1}`
      this.getGalleryInfo(link)
    },
    getAllComment() {
      const link = this.$route.query.link + '?hc=1#comments'
      this.getGalleryInfo(link)
      this.hasMore = false
    },
    toggleFavourite() {
      this.$store
        .dispatchPromise('UpdateBookInfo', {
          isFavourite: !this.bookInfo.isFavourite
        })
        .then(() => {
          dbUpdate(this.$store.state.bookInfo)
        })
    }
  },
  mounted() {
    this.getGalleryInfo().catch(e => {
      this.detailLoading = false
      const bookInitInfo = {
        language: 'unknown',
        fileSize: 'unknown',
        length: 'unknown',
        favoriteCount: 0
      }
      this.$store.dispatch('UpdateBookInfo', bookInitInfo)
      this.$message.error('加载页面信息失败,请刷新页面')
      console.log(e)
    })
  }
}
</script>

<style scoped>
.bookTitle {
  ext-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  color: #303133;
}

.cover {
  border: 1px solid;
  height: 266px;
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cover > img {
  width: 100%;
  max-height: 100%;
}

.uploader {
  color: #909399;
}

.bookInfo {
  min-width: 200px;
  margin-left: 20px;
}

.el-form-item {
  margin-bottom: 5px;
}

.groupContainer {
  display: flex;
  flex-direction: row;
  margin: 10px 10px 5px 10px;
}

.groupName {
  width: 20%;
}

.tags {
  width: 80%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.prevContainer {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
}

.previewBox {
  margin: 1vh;
  border: 1px solid;
}

.comment {
  margin-bottom: 5px;
}

.commentInfo {
  font-size: small;
  margin-top: 5px;
  color: #606266;
}
</style>
