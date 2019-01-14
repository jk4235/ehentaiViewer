<template>
    <el-container>
        <el-header>test</el-header>
        <el-main>
            <ul>
                <li v-for="link in links">{{ link }}</li>
            </ul>
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
      links: []
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
      const reNextLink = /^https:\/\/e-hentai.org\/g\//
      $('tr').find('a').each((index, cv) => {
        const link = cv.attribs.href
        if (reNextLink.test(link)) {
          this.links.push(link)
        }
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style scoped>

</style>