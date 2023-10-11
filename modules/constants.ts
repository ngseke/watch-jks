import * as dotenv from 'dotenv'
dotenv.config()

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
export const FIREBASE_CONFIG = (() => {
  try {
    return JSON.parse(process.env.FIREBASE_CONFIG ?? '') ?? {}
  } catch (e) {
    return {}
  }
})()
export const CRAWL_INTERVAL = Number(process.env.CRAWL_INTERVAL) || 1000 * 60 * 30
