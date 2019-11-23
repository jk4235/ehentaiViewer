import db from './database'
import { dbUpdateCacheUrl } from '@/utils/dbOperate'
import request from 'request'
import Event from '@/utils/EventEmitter'

const event = new Event()
const fs = require('fs')
const path = require('path')

const requestQueue = []

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
  return new Promise((resolve, reject) => {
    event.once(`check${url}CachingDone`, isCaching => {
      if (isCaching) {
        resolve('caching')
      } else if (isCacheExists(path)) {
        resolve('done')
      } else {
        dbUpdateCacheUrl(
          {
            cacheUrl: url,
            status: 'caching',
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
  let timeoutId = null
  mkdirsSync(dirname)
  const req = request(url)
  const writeStream = fs.createWriteStream(path)
  req.pipe(writeStream)
  requestQueue.push({
    url,
    writeStream
  })
  writeStream.on('finish', function() {
    const index = requestQueue.findIndex(cv => cv.url === url)
    requestQueue.splice(index, 1)
    dbUpdateCacheUrl(
      {
        cacheUrl: url,
        status: 'done',
        timeStamp: new Date().getTime()
      },
      () => {
        event.emit(`${url}`, 'done')
      }
    )
  })
  writeStream.on('error', e => {
    req.abort()
    console.log(e)
    clearTimeout(timeoutId)
    writeStream.end()
    const index = requestQueue.findIndex(cv => cv.url === url)
    requestQueue.splice(index, 1)
    removeCache(url, path)
  })
  req.on('end', function() {
    clearTimeout(timeoutId)
  })
  req.on('error', function(err) {
    writeStream.emit('error', err)
  })
  req.on('timeout', function(e) {
    req.abort()
    req.emit('error', 'timeout')
  })
  timeoutId = setTimeout(() => {
    req.emit('timeout')
  }, 3 * 60 * 1000)
})

export function stopRequest(url, path) {
  const target = requestQueue.find(cv => cv.url === url)
  if (target) {
    target.writeStream.emit('error', 'stopRequest')
  } else {
    removeCache(url, path)
  }
}

function removeCache(url, path) {
  db.remove({ cacheUrl: url }, () => {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
      event.emit(`${url}`, 'error')
    }
  })
}

export function isCacheExists(path) {
  return fs.existsSync(path)
}

export function isDownloading(url) {
  return requestQueue.findIndex(cv => cv.url === url) >= 0
}

function checkCachingStatus(url) {
  let isCaching = true
  db.findOne({ cacheUrl: url }, (e, doc) => {
    if (doc) {
      isCaching = doc.status === 'caching'
    } else {
      isCaching = false
    }
    event.emit(`check${url}CachingDone`, isCaching)
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
