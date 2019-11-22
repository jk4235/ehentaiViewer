import db from './database'
import { dbUpdateCacheUrl } from '@/utils/dbOperate'
import request from 'request'

const fs = require('fs')
const path = require('path')

function mkdirsSync (dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

export function cachePic (url, path, dirname) {
  return new Promise((resolve, reject) => {
    const isExists = isCacheExists(path)
    if (isExists) {
      resolve('caching')
    } else {
      let timeoutId = null
      dbUpdateCacheUrl({ cacheUrl: url, status: 'caching', timeStamp: new Date().getTime() })
      mkdirsSync(dirname)
      const req = request(url)
      const writeStream = fs.createWriteStream(path)
      req.pipe(writeStream)
      writeStream.on('finish', function () {
        dbUpdateCacheUrl({ cacheUrl: url, status: 'done', timeStamp: new Date().getTime() })
        resolve('done')
      })
      req.on('end', function () {
        clearTimeout(timeoutId)
      })
      req.on('error', function (err) {
        console.log(err)
        clearTimeout(timeoutId)
        db.remove({ cacheUrl: url })
        if (fs.existsSync(path)) {
          fs.unlinkSync(path)
        }
      })
      req.on('timeout', function (e) {
        req.abort()
        db.remove({ cacheUrl: url })
        if (fs.existsSync(path)) {
          fs.unlinkSync(path)
        }
      })
      timeoutId = setTimeout(() => {
        req.emit('timeout')
      }, 5 * 60 * 1000)
    }
  })
}

export function isCacheExists (path) {
  return fs.existsSync(path)
}

export function isCaching (url) {
  let isCaching = true
  return new Promise((resolve, reject) => {
    db.findOne({ cacheUrl: url }, (e, doc) => {
      if (doc) {
        isCaching = doc.status === 'caching'
      } else {
        isCaching = false
      }
      resolve(isCaching)
    })
  })
}
