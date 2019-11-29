import cheerio from 'cheerio'

class HtmlParser {
  $ = null
  load(html) {
    this.$ = cheerio.load(html)
  }
}

export class CommentParser extends HtmlParser {
  parseHtml(html) {
    this.load(html)
    return this.parseComment()
  }
  parseComment() {
    const $ = this.$
    const commentList = []
    const hasMore = $('#chd p').length > 1
    $('#cdiv .c1').each((index, cv) => {
      const author = $(cv).find('a').eq(0).text()
      const content = $(cv).find('.c6').eq(0).text()
      const score = $(cv).find('.c5 span').eq(0).text()
      const commentTime = $(cv).find('.c3').eq(0).text().match(/\d+.*:\d+/)[0]
      commentList.push({
        author,
        content,
        score,
        commentTime
      })
    })
    return { commentList, hasMore }
  }
}

export class ReadHtmlParser extends HtmlParser {
  parseHtml(html, page) {
    this.load(html)
    return this.parseReadHtml(page)
  }
  parseReadHtml(page) {
    const $ = this.$
    const index =
      Number(
        $('#i2')
          .find('span')
          .eq(0)
          .text()
      ) - 1
    const picLink = $('#img').attr('src')
    const currentPage = page
    const prevPage = $('#prev').attr('href')
    const nextPage = $('#next').attr('href')
    const firstPage = $('#i4')
      .find('a')
      .eq(0)
      .attr('href')
    const lastPage = $('#i4')
      .find('a')
      .eq(3)
      .attr('href')
    const reloadUrl =
      currentPage +
      ReadHtmlParser.buildReloadUrl(
        $('#loadfail')
          .prop('onclick')
          .split(' ')[1]
      )
    return {
      index,
      currentPage,
      picLink,
      prevPage,
      nextPage,
      firstPage,
      lastPage,
      isFirstPage: prevPage === firstPage && index === 0,
      isLastPage: currentPage === lastPage,
      reloadUrl
    }
  }
  static buildReloadUrl(str) {
    const param = str.match(/\d.*\d/)[0]
    return `?nl=${param}`
  }
}

export class HomeHtmlParser extends HtmlParser {
  parseHtml(html) {
    this.load(html)
    return this.parseHomeHtml()
  }
  parseHomeHtml() {
    const $ = this.$
    const books = []
    const totalResults = Number(
      $('p[class="ip"]')
        .eq(0)
        .text()
        .split(' ')[1]
        .replace(/,/g, '')
    )
    const totalResultPages = Math.ceil(totalResults / 25)
    $('table[class="itg gltc"] tr:not(:first-child)').each((index, cv) => {
      const link = $(cv).find('.gl3c a')
      if (link.length === 0) return true
      const detailLink = link.prop('href').split('.org')[1]
      let title = $(cv)
        .find('.gl3c a .glink')
        .text()
      const coverEl = $(cv).find('.glthumb img')
      let cover = null
      if (coverEl.length) {
        cover = coverEl.prop('src').match('data:')
          ? coverEl.prop('data-src')
          : coverEl.prop('src')
      } else {
        cover = HomeHtmlParser.getCover(
          $(cv)
            .find('.glthumb')
            .text()
        )
      }
      const type = $(cv)
        .find('.gl1c div')
        .text()
      const rate = HomeHtmlParser.countRate(
        $(cv)
          .find('.ir')
          .attr('style')
      )
      const uploader = $(cv)
        .find('.gl4c a')
        .text()
      const uploadTime = $(cv)
        .find('.gl2c div .ir')
        .parent()
        .eq(1)
        .find('div')
        .eq(0)
        .text()
      const totalPages = $(cv)
        .find('.gl2c div .ir')
        .parent()
        .eq(0)
        .text()
      books.push({
        detailLink,
        cover,
        title,
        type,
        rate,
        uploader,
        uploadTime,
        totalPages
      })
    })
    return { books, totalResults, totalResultPages }
  }
  static countRate(rateStr) {
    let rate = 5
    const [num1, num2] = rateStr
      .split(';')[0]
      .slice(20)
      .split(' ')
      .map(cv => cv.replace('px', ''))
    rate = rate + Number(num1) / 16
    if (num2 === '-21') {
      rate--
      rate += 0.5
    }
    return rate
  }
  static getCover(str) {
    const a = str.split('~', 4)
    return a[0] === 'init'
      ? `http://${a[1]}/${a[2]}`
      : `https://${a[1]}/${a[2]}`
  }
}

export class GalleryHtmlParser extends HtmlParser {
  parseHtml(html) {
    this.load(html)
    return this._getInfo()
  }
  _getInfo() {
    const offensiveString =
      '(And if you choose to ignore this warning, you lose all rights to complain about it.)'
    const piningString = 'This gallery is pining for the fjords.'

    const isOffensive = this.$(`p:contains(${offensiveString})`).length > 0
    const isPining = this.$(`p:contains(${piningString})`).length > 0

    if (isPining) {
      return { isPining }
    }

    if (isOffensive) {
      const viewLink = this.$('a:contains("View Gallery")')
        .prop('href')
        .split('.org')[1]
      const ignoreLink = this.$('a:contains("Never Warn Me Again")')
        .prop('href')
        .split('.org')[1]
      return {
        isOffensive,
        viewLink,
        ignoreLink
      }
    }

    return this._parseGalleryHtml()
  }
  _parseGalleryHtml() {
    const bookDetailInfo = this.parseDetailInfo(this.$('#gdd'))
    const rateDetailInfo = this.parseRateInfo()
    const tagGroupInfo = this.getGalleryTagGroup()
    const previewInfo = this.parsePreview()
    return {
      bookDetailInfo,
      rateDetailInfo,
      tagGroupInfo,
      previewInfo
    }
  }
  findDetailText(el, keyword) {
    return el
      .find('td')
      .filter((i, cv) => this.$(cv).text() === `${keyword}:`)
      .next()
      .text()
      .trim()
  }
  parseDetailInfo(el) {
    const language = this.findDetailText(el, 'Language')
    const fileSize = this.findDetailText(el, 'File Size')
    const length = this.findDetailText(el, 'Length')
    const favorited = this.findDetailText(el, 'Favorited')
    let favoriteCount = 0
    switch (favorited) {
      case 'Never':
        favoriteCount = 0
        break
      case 'Once':
        favoriteCount = 1
        break
      default:
        const index = favorited.trim().indexOf(' ')
        if (index === -1) {
          favoriteCount = 0
        } else {
          favoriteCount = favorited.split(' ')[0]
        }
    }
    return {
      language,
      fileSize,
      length,
      favoriteCount
    }
  }
  parseRateInfo() {
    const peopleCount = this.$('#rating_count')
      .text()
      .trim()
    const average = this.$('#rating_label')
      .text()
      .trim()
      .split(' ')[1]
    return {
      peopleCount,
      average
    }
  }
  parseTagGroup(el) {
    const group = {
      groupName: null,
      tagList: []
    }
    let nameSpace = this.$(el)
      .find('td')
      .eq(0)
      .text()
    nameSpace = nameSpace.substring(0, nameSpace.length - 1)
    group.groupName = nameSpace
    const tags = this.$(el)
      .find('td')
      .eq(1)
      .children()
    for (let i = 0, n = tags.length; i < n; i++) {
      let tag = tags.eq(i).text()
      const index = tag.indexOf('|')
      if (index >= 0) {
        tag = tag.substring(0, index).trim()
      }
      group.tagList.push(tag)
    }
    return group.tagList.length > 0 ? group : null
  }
  getGalleryTagGroup() {
    const tagList = this.$('#taglist')
    const tagGroups = tagList.find('tr')
    const tagGroupList = []
    for (let i = 0, n = tagGroups.length; i < n; i++) {
      const group = this.parseTagGroup(tagGroups.eq(i))
      if (group !== null) {
        tagGroupList.push(group)
      }
    }
    return tagGroupList
  }
  parsePreview() {
    const $ = this.$
    const pagesTitle = $('.ptt')
      .prev()
      .text()
    const totalPages = pagesTitle.match(/f\s\d+/)[0].split(' ')[1]
    const currentShowPages = pagesTitle.match(/-\s\d+/)[0].split(' ')[1]
    const previewPicList = $('#gdt').children()
    const previewPicLink = []
    previewPicList.each((index, cv) => {
      const picLink = $(cv)
        .find('a')
        .attr('href')
      const largePicStyle = $(cv)
        .children()
        .first()
        .attr('style')
      let largePicUrl = null
      if (largePicStyle) {
        largePicUrl = largePicStyle.match(/http.*jpg/)[0]
      }
      if (picLink && largePicUrl) {
        previewPicLink.push({
          picLink,
          largePicUrl
        })
      }
    })
    return {
      totalPages,
      prevInfo: {
        currentShowPages,
        previewPicLink
      }
    }
  }
}
