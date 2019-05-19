import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

const db = new Datastore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), '/data.db')
})

db.removeIndex('detailLink')
db.remove({detailLink: '/g/1416953/5070f50b5b/'})

export default db
