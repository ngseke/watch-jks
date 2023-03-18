import { startListener } from './modules/telegram'
import { task } from './modules/task'

startListener()

setInterval(task, 1000 * 60 * 30)
task()
