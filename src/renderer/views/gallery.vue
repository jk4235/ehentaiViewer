<template>
    <div>
        <h3 class="bookTitle">{{ bookInfo.title }}</h3>
        <div style="display: flex; flex-direction: row">
            <div class="cover">
                <img :src="bookInfo.cover" alt="cover">
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
                        <span>{{ bookInfo.favoriteCount }}<i class="fa fa-heart" style="color: #F56C6C"></i></span>
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
        <div class="rate"
             v-loading="detailLoading"
             style="display: flex; justify-content: center; margin-top: 10px; flex-direction: column">
            <el-rate
                    style="display: flex; justify-content: center"
                    v-model="bookInfo.rate"
                    disabled
                    text-color="#ff9900">
            </el-rate>
            <div style="display: flex; justify-content: center; margin-top: 5px">
                <span style="color: #ff9900">{{ rateText[bookInfo.rate * 2] }}</span>
                <span>{{ `(${rateDetailInfo.average}, ${rateDetailInfo.peopleCount})` }}</span>
            </div>
        </div>
        <div style="margin-top: 10px">
            <el-button style="width: 100%" type="success">阅读</el-button>
        </div>
    </div>
</template>

<script>
import { getGalleryInfo } from '../api/ehentai'
import { parseGalleryHtml } from '../utils/parseHtml'

export default {
  name: 'gallery',
  data () {
    return {
      rateText: [
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
      }
    }
  },
  computed: {
    bookInfo () {
      return this.$store.state.bookInfo
    }
  },
  methods: {
    getGalleryInfo () {
      this.detailLoading = true
      getGalleryInfo(this.bookInfo.detailLink).then(res => {
        parseGalleryHtml.call(this, res).then(res => {
          const { bookDetailInfo, rateDetailInfo } = res
          this.$store.dispatch('UpdateBookInfo', bookDetailInfo)
          Object.assign(this.rateDetailInfo, rateDetailInfo)
          this.detailLoading = false
        })
      }).catch(() => { this.detailLoading = false })
    }
  },
  mounted () {
    this.getGalleryInfo()
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
        height:266px;
        width:200px;
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
</style>