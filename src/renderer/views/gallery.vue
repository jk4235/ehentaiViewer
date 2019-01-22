<template>
    <div>
        <h3 class="bookTitle">{{ bookInfo.title }}</h3>
        <div style="display: flex; flex-direction: row">
            <div class="cover">
                <img :src="bookInfo.cover" alt="cover">
            </div>
            <div class="bookInfo">
                <el-form label-position="left" label-width="8vh">
                    <el-form-item label="Type">
                        <el-tag>{{ bookInfo.type.toUpperCase() }}</el-tag>
                    </el-form-item>
                    <el-form-item label="Language">
                        <span class="uploader">{{ bookInfo.uploader }}</span>
                    </el-form-item>
                    <el-form-item label="Length">
                        <span class="uploader">{{ bookInfo.uploader }}</span>
                    </el-form-item>
                    <el-form-item label="File Size">
                        <span class="uploader">{{ bookInfo.uploader }}</span>
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
        <div class="rate" style="display: flex; justify-content: center; margin-top: 10px">
            <el-rate
                    v-model="bookInfo.rate"
                    disabled
                    text-color="#ff9900">
            </el-rate>
            <span style="color: #ff9900">{{ rateText[Math.ceil(bookInfo.rate * 2 + 0.5) - 1] }}</span>
        </div>
        <div style="margin-top: 10px">
            <el-button style="width: 100%" type="success">阅读</el-button>
        </div>
    </div>
</template>

<script>
import { getGalleryInfo } from '../api/ehentai'

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
      ]
    }
  },
  computed: {
    bookInfo () {
      return this.$store.state.bookInfo
    }
  },
  methods: {
    getGalleryInfo () {
      getGalleryInfo(this.link).then(res => {

      })
    }
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
        margin-bottom: 10px;
    }
</style>