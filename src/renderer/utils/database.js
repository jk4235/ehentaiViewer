import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

const db = new Datastore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), '/data.db')
})

export default db
