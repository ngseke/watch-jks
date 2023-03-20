import { startListener } from './modules/telegram'
import { task } from './modules/task'
import { startWeb } from './modules/web'

startListener()

setInterval(task, 1000 * 60 * 10)
task()

startWeb()
