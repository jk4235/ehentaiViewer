import db from './database'
import { dbUpdateCacheUrl } from '@/utils/dbOperate'
import request from 'request'
import Event from '@/utils/EventEmitter'

const event = new Event()
const fs = require('fs')
const path = require('path')

const taskQueue = []
const requestQueue = []
const MAX_REQUEST_NUMBER = 10

let taskInterval = null

function createInterval() {
  taskInterval = setInterval(() => {
    // // console.log(`当前待处理任务数: ${taskQueue.length}`)
    // // console.log(`当前进行中任务数: ${requestQueue.length}`)
    if (requestQueue.length < MAX_REQUEST_NUMBER && taskQueue.length > 0) {
      const { url, path, dirname } = taskQueue.shift()
      requestPic(url, path, dirname)
    }
    if (requestQueue.length === 0 && taskQueue.length === 0) {
      // console.log('轮询停止')
      taskInterval = clearInterval(taskInterval)
    }
  }, 1000)
}

function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

export function cachePic(url, path, dirname) {
  if (!taskInterval) {
    // console.log('创建轮询')
    createInterval()
  }
  return new Promise((resolve, reject) => {
    event.once(`check${url}CachingDone`, isCaching => {
      // console.log(`${path}缓存 ${isCaching}`)
      if (isCaching) {
        // console.log(`${path}正在缓存中`)
        resolve('caching')
      } else if (isCacheExists(path)) {
        // console.log(`${path}已在本地缓存过图片`)
        resolve('done')
      } else {
        // console.log(`${path}本地无缓存,进入缓存流程`)
        dbUpdateCacheUrl(
          {
            cacheUrl: url,
            status: 'caching',
            dirname,
            timeStamp: new Date().getTime()
          },
          () => {
            event.emit('changeStatusToCaching', url, path, dirname)
          }
        )
      }
    })
    event.once(`${url}`, status => {
      resolve(status)
    })
    checkCachingStatus(url)
  })
}

event.on('changeStatusToCaching', (url, path, dirname) => {
  // console.log(`${path}开始缓存`)
  taskQueue.push({
    url, path, dirname
  })
})

function requestPic(url, path, dirname) {
  let timeoutId = null
  mkdirsSync(dirname)
  const writeStream = fs.createWriteStream(path)
  const req = request(url)
  req.on('response', function(response) {
    if (response.statusCode >= 400) {
      req.emit('error', `statusCode: ${response.statusCode}`)
    }
  }).on('error', function(err) {
    console.error(`${path}请求失败`)
    writeStream.emit('error', err)
  }).pipe(writeStream)
  // console.log(`${path}进入请求队列`)
  requestQueue.push({
    url,
    writeStream
  })
  writeStream.on('finish', function() {
    // console.log(`${path}缓存处理完成, 离开请求队列`)
    const index = requestQueue.findIndex(cv => cv.url === url)
    const target = requestQueue.splice(index, 1)
    if (target[0].status === 'failed') {
      removeCache(url, path)
    } else {
      dbUpdateCacheUrl(
        {
          cacheUrl: url,
          status: 'done',
          dirname,
          timeStamp: new Date().getTime()
        },
        () => {
          event.emit(`${url}`, 'done')
        }
      )
    }
  })
  writeStream.on('error', e => {
    console.error(`${path}缓存失败, 离开请求队列`)
    req.abort()
    // console.log(e)
    clearTimeout(timeoutId)
    const index = requestQueue.findIndex(cv => cv.url === url)
    requestQueue[index].status = 'failed'
    writeStream.end()
  })
  req.on('end', function() {
    // console.log(`${path}请求结束`)
    clearTimeout(timeoutId)
  })
  req.on('timeout', function(e) {
    console.error(`${path}请求超时`)
    req.abort()
    req.emit('error', 'timeout')
  })
  timeoutId = setTimeout(() => {
    req.emit('timeout')
  }, 3 * 60 * 1000)
}

export function stopRequest(url, path) {
  const target = requestQueue.find(cv => cv.url === url)
  if (target) {
    target.writeStream.emit('error', 'stopRequest')
  } else {
    removeCache(url, path)
  }
}

export function clearRequestQueue() {
  // console.log('停止所有缓存请求')
  taskQueue.splice(0)
  while (requestQueue.length > 0) {
    requestQueue[0].writeStream.emit('error', 'stopRequest')
  }
}

function removeCache(url, path) {
  // console.log(`${path}清除缓存,清除本地文件`)
  db.remove({ cacheUrl: url }, () => {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
      event.emit(`${url}`, 'error')
    }
  })
}

export function isCacheExists(path) {
  const res = fs.existsSync(path)
  // console.log(`${path}是否已存在于本地: ${res}`)
  return res
}

export function isDownloading(url) {
  const res = requestQueue.findIndex(cv => cv.url === url) >= 0
  // console.log(`${url}是否正在下载: ${res}`)
  return res
}

function checkCachingStatus(url) {
  // console.log(`开始检查${url}缓存`)
  let isCaching = true
  db.findOne({ cacheUrl: url }, (e, doc) => {
    if (doc) {
      isCaching = doc.status === 'caching'
    } else {
      isCaching = false
    }
    event && event.emit(`check${url}CachingDone`, isCaching)
  })
}

export function isCachingOrExists(url, path) {
  return new Promise((resolve, reject) => {
    const isExist = isCacheExists(path)
    checkCachingStatus(url)
    event.once(`check${url}CachingDone`, isCaching => {
      const data = {
        isExist,
        isCaching
      }
      resolve(data)
    })
  })
}
