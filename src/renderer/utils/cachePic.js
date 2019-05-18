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
    isCaching(url).then(caching => {
      const isExists = isCacheExists(path) || caching
      if (isExists) {
        resolve(caching ? 'caching' : '')
      } else {
        let timeoutId = null
        dbUpdateCacheUrl({ cacheUrl: url, status: 'caching', timeStamp: new Date().getTime() })
        mkdirsSync(dirname)
        const req = request(url)
        const writeStream = fs.createWriteStream(path)
        req.pipe(writeStream)
        writeStream.on('finish', function () {
          resolve()
        })
        req.on('end', function () {
          db.remove({ cacheUrl: url })
          clearTimeout(timeoutId)
        })
        req.on('error', function (err) {
          console.log(err)
          clearTimeout(timeoutId)
          db.remove({ cacheUrl: url })
          reject(err)
        })
        req.on('timeout', function (e) {
          req.abort()
        })
        timeoutId = setTimeout(() => {
          req.emit('timeout')
        }, 5 * 60 * 1000)
      }
    })
  })
}

export function isCacheExists (path) {
  return fs.existsSync(path)
}

export function isCaching (url) {
  let isCaching = false
  const currentTime = new Date().getTime()
  return new Promise((resolve, reject) => {
    db.findOne({ cacheUrl: url }, (e, doc) => {
      if (doc) {
        isCaching = doc.status === 'caching' && ((currentTime - doc.timeStamp) < 5 * 60 * 1000)
        if (!isCaching) {
          db.remove({ cacheUrl: url })
        }
      }
    })
    resolve(isCaching)
  })
}
