import dayjs from 'dayjs'
import TelegramBot from 'node-telegram-bot-api'
import { TELEGRAM_BOT_TOKEN } from './constants'
import { getCrawledAt } from './crawler'
import { Product } from './products'
import { addSubscriber, getAllSubscriberIds, getRecentProducts, removeSubscriber } from './database'

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true })

const formatDateTime = (value: dayjs.ConfigType) =>
  dayjs(value).format('YYYY/MM/DD HH:mm')

export async function send (chatId: number, product: Product) {
  const formattedPrice = new Intl.NumberFormat('en').format(product.price)
  const caption = [
    product.name,
    `<b>NT$ ${formattedPrice}</b>`,
    product.link,
    '',
    `<i>(crawled at: ${formatDateTime(product.crawledAt)})</i>`,
  ].join('\n')

  if (!product.img) {
    await bot.sendMessage(chatId, caption, { parse_mode: 'HTML' })
  }

  await bot.sendPhoto(
    chatId,
    product.img,
    { caption, parse_mode: 'HTML' }
  )
}

export async function sendToAllSubscribers (product: Product) {
  const subscriberIds = await getAllSubscriberIds()

  return await Promise.allSettled(
    subscriberIds.map(async chatId => {
      await send(chatId, product)
    })
  )
}

const getDefaultMessage = async (chatId: number) => {
  const subscriberIds = new Set(await getAllSubscriberIds())
  const isSubscribed = subscriberIds.has(chatId)

  const subscribeStatusMessage = isSubscribed
    ? `✅ You've already subscribed. <i>(id: ${chatId})</i>`
    : '💡 <b>Type /subscribe to subscribe now!</b>'

  const crawledAt = getCrawledAt()
  const crawledAtMessage = crawledAt
    ? `⏰ Last crawled at: <b>${formatDateTime(crawledAt)}</b>`
    : ''

  return [
    '🐟 Hi, I\'m Watch JKS Bot',
    crawledAtMessage,
    '',
    subscribeStatusMessage,
  ].join('\n')
}

export function startListener () {
  bot.on('text', async (message) => {
    const chatId = message.chat.id
    const text = message.text?.trim() ?? ''

    const maybeCommand = text.toLowerCase()

    try {
      if (maybeCommand === '/subscribe') {
        await addSubscriber(chatId)
        await bot.sendMessage(chatId, '✅ You have successfully subscribed.')
        return
      }

      if (maybeCommand === '/unsubscribe') {
        await removeSubscriber(chatId)
        await bot.sendMessage(chatId, '👋 See ya.')
        return
      }

      if (maybeCommand.startsWith('/recent')) {
        const limit = (() => {
          try {
            const limitString = maybeCommand.split('/recent')[1].trim()
            // If the number is not provided, return default the limit.
            if (!limitString) return 5

            const maybeNumber = parseInt(limitString)
            return maybeNumber || 0
          } catch (e) {
            return 0
          }
        })()
        const [limitMin, limitMax] = [1, 30]
        if (limit < limitMin || limit > limitMax) {
          await bot.sendMessage(
            chatId,
            `🔺 The limit should be in the range of ${limitMin} ~ ${limitMax}!`
          )
          return
        }

        const recentProducts = await getRecentProducts(limit)
        await Promise.allSettled(
          Object.values(recentProducts)
            .map((product) => send(chatId, product))
        )
        return
      }

      await bot.sendMessage(
        chatId,
        await getDefaultMessage(chatId),
        { parse_mode: 'HTML' }
      )
    } catch (e) {
      await bot.sendMessage(chatId, '🙁 Something went wrong...')
    }
  })
}
