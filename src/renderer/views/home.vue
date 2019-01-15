<template>
    <el-container>
        <el-header style="height: 120px; width: 485px">
            <div class="typeSelect">
                <el-tag
                    v-for="(v, k) in types"
                    @click.native="toggleSelect(k)"
                    :type="v ? 'default' : 'info'">{{ k }}</el-tag>
            </div>
            <el-row type="flex" justify="space-between">
                <el-col :span="17">
                    <div>
                        <el-input placeholder="Search Keywords"></el-input>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div style="display: flex; justify-content: space-between">
                        <el-button class="searchBtn">搜索</el-button>
                        <el-button class="searchBtn">清除</el-button>
                    </div>
                </el-col>
            </el-row>
        </el-header>
        <el-main style="padding-top: 0">
            <el-card shadow="hover" v-for="book in books">
                <div class="cover"><img :src="book.cover"></div>
                <a :href="book.detailLink">{{ book.detailLink }}</a>
            </el-card>
        </el-main>
    </el-container>
</template>

<script>
import { getInitData } from '../api/ehentai'
import cheerio from 'cheerio'

export default {
  name: 'home',
  data () {
    return {
      types: {
        'DOUJINSHI': 1,
        'MANGA': 1,
        'ARTIST CG': 0,
        'GAME CS': 0,
        'WESTERN': 0,
        'NON-H': 0,
        'IMAGE SET': 0,
        'COSPLAY': 0,
        'ASIAN PORN': 0,
        'MISC': 0
      },
      books: []
    }
  },
  methods: {
    init () {
      getInitData().then(res => {
        this.parseHtml(res)
      })
    },
    parseHtml (html) {
      const $ = cheerio.load(html)
      $('tr[class="gtr0"], tr[class="gtr1"]').each((index, cv) => {
        const detailLink = $(cv).find('.it5 > a').prop('href')
        let cover = null
        if ($(cv).find('.it2').find('img').length) {
          cover = $(cv).find('.it2').find('img').prop('src')
        } else {
          cover = this.getCover($(cv).find('.it2').text())
        }
        this.books.push({
          detailLink,
          cover
        })
      })
    },
    toggleSelect (k) {
      this.types[k] = this.types[k] ? 0 : 1
    },
    getCover (str) {
      const a = str.split('~', 4)
      return a[0] === 'init' ? `http://${a[1]}/${a[2]}` : `https://${a[1]}/${a[2]}`
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style scoped>
.typeSelect{
    margin: auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-content: space-around;
    height: 75px;
}
.searchBtn{
    padding: 10px;
}
.cover{
    border:2px solid;
    height:133px;
    width:100px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.cover > img {
    width: 100%;
    max-height: 100%;
}
</style>