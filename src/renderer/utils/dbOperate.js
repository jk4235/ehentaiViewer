import db from './database'

function shouldNotRemove (item) {
  return item.cache.length !== 0 || item.isFavourite || item.download.length !== 0
}

export function dbUpdate (book) {
  const { detailLink } = book
  delete book._id
  db.findOne({ detailLink }, (e, doc) => {
    if (!doc) {
      db.insert(book)
    } else {
      db.update({ detailLink }, { $set: book }, { upsert: true }, (e) => {
        db.findOne({ detailLink }, (e, doc) => {
          if (doc && !shouldNotRemove(doc)) {
            db.remove({ detailLink })
          }
        })
      })
    }
  })
}

export function dbUpdateCacheUrl (cache) {
  const { cacheUrl } = cache
  delete cache._id
  db.findOne({ cacheUrl }, (e, doc) => {
    if (!doc) {
      db.insert(cache)
    } else {
      db.update({ cacheUrl }, { $set: cache }, { upsert: true })
    }
  })
}
