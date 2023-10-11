import { startListener } from './modules/telegram'
import { task } from './modules/task'
import { CRAWL_INTERVAL } from './modules/constants'
import { authReady } from './modules/firebase'

authReady().then(() => {
  startListener()
  task()
  setInterval(task, CRAWL_INTERVAL)
})
