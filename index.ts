import { startListener } from './modules/telegram'
import { task } from './modules/task'
import { CRAWL_INTERVAL } from './modules/constants'
import { waitForAuthReady } from './modules/firebase'
import { initProductsCache } from './modules/database'

waitForAuthReady().then(async () => {
  await initProductsCache()

  startListener()
  task()
  setInterval(task, CRAWL_INTERVAL)
})
