import cheerio from 'cheerio'
import { getGalleryInfo } from '../api/ehentai'

function countRate (rateStr) {
  let rate = 5
  const [num1, num2] = rateStr.split(';')[0].slice(20).split(' ').map(cv => cv.replace('px', ''))
  rate = rate + Number(num1) / 16
  if (num2 === '-21') {
    rate--
    rate += 0.5
  }
  return rate
}

function getCover (str) {
  const a = str.split('~', 4)
  return a[0] === 'init' ? `http://${a[1]}/${a[2]}` : `https://${a[1]}/${a[2]}`
}

export function parseHomeHtml (html) {
  const $ = cheerio.load(html)
  const books = []
  $('tr[class="gtr0"], tr[class="gtr1"]').each((index, cv) => {
    const detailLink = $(cv).find('.it5 > a').prop('href').split('.org')[1]
    let cover = null
    let title = $(cv).find('.it5 > a').text()
    const coverEl = $(cv).find('.it2 img')
    if (coverEl.length) {
      cover = coverEl.prop('src')
    } else {
      cover = getCover($(cv).find('.it2').text())
    }
    const type = $(cv).find('.itdc img').prop('alt')
    const rate = countRate($(cv).find('.ir').attr('style'))
    const uploader = $(cv).find('.itu a').text()
    const uploadTime = $(cv).find('.itd').eq(0).text()
    books.push({
      detailLink,
      cover,
      title,
      type,
      rate,
      uploader,
      uploadTime
    })
  })
  return books
}

export function parseGalleryHtml (html) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(html)
    const offensiveString = '(And if you choose to ignore this warning, you lose all rights to complain about it.)'
    const piningString = 'This gallery is pining for the fjords.'

    const isOffensive = $(`p:contains(${offensiveString})`).length > 0
    const isPining = $(`p:contains(${piningString})`).length > 0

    if (isPining) {
      this.$alert('本内容只对高级用户开放,将退回首页', '提示', {
        confirmButtonText: '确定',
        callback: () => {
          this.$router.push('/home')
        }
      })
    }
    if (isOffensive) {
      const vNode = (function (h) {
        /* eslint-disable */
        return (
          <div>
            <p>可能包含令人不适的内容,是否继续?</p>
            <el-checkbox ref="noMoreNotice">不再提醒</el-checkbox>
          </div>
        )
        /* eslint-enable */
      }.call(this, this.$createElement))
      this.$confirm(vNode, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const isNoMoreNotice = this.$refs.noMoreNotice.value
        const viewLink = $('a:contains("View Gallery")').prop('href').split('.org')[1]
        const ignoreLink = $('a:contains("Never Warn Me Again")').prop('href').split('.org')[1]
        getGalleryInfo(isNoMoreNotice ? ignoreLink : viewLink).then(res => {
          resolve(_parseGalleryHtml($.load(res)))
        })
      }).catch(() => {
        this.$router.push('/home')
      })
    }

    if (!isPining && !isOffensive) {
      resolve(_parseGalleryHtml($))
    }
  })
}

function _parseGalleryHtml ($) {
  const bookDetailInfo = parseDetailInfo($, $('#gdd'))
  const rateDetailInfo = parseRateInfo($)
  return {
    bookDetailInfo,
    rateDetailInfo
  }
}

function findDetailText ($, el, keyword) {
  return el.find('td').filter(
    (i, cv) => $(cv).text() === `${keyword}:`
  ).next().text().trim()
}

function parseDetailInfo ($, el) {
  const language = findDetailText($, el, 'Language')
  const fileSize = findDetailText($, el, 'File Size')
  const length = findDetailText($, el, 'Length')
  const favorited = findDetailText($, el, 'Favorited')
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

function parseRateInfo ($) {
  const peopleCount = $('#rating_count').text().trim()
  const average = $('#rating_label').text().trim().split(' ')[1]
  return {
    peopleCount,
    average
  }
}
