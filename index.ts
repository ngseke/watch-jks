import { startListener } from './modules/telegram'
import { task } from './modules/task'
import { startWeb } from './modules/web'
import { CRAWL_INTERVAL } from './modules/constants'

startListener()
startWeb()
task()

setInterval(task, CRAWL_INTERVAL)
