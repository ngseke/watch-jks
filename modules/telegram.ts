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
    '<b>[JKS New Product Notification]</b>',
    product.name,
    `<b>NT$ ${formattedPrice}</b>`,
    product.link,
    `\n<i>(crawled at: ${formatDateTime(product.crawledAt)})</i>`,
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
    ? `\n✅ You are already subscribed. <i>(id: ${chatId})</i>`
    : '\n\n💡 Type /subscribe to subscribe now!'

  const crawledAt = getCrawledAt()
  const crawledAtMessage = crawledAt
    ? `\n⏰ Last crawled at: <b>${formatDateTime(crawledAt)}</b>`
    : ''

  return [
    '🐟 Hi, I\'m Watch JKS Bot\n',
    crawledAtMessage,
    subscribeStatusMessage,
  ].join('')
}

export function startListener () {
  bot.on('text', (message) => {
    const chatId = message.chat.id
    const text = message.text?.trim() ?? ''

    const maybeCommand = text.toLowerCase()

    ;(async () => {
      if (maybeCommand === '/subscribe') {
        await addSubscriber(chatId)
        await bot.sendMessage(chatId, 'You have successfully subscribed. 🎉')
        return
      }

      if (maybeCommand === '/unsubscribe') {
        await removeSubscriber(chatId)
        await bot.sendMessage(chatId, 'See you later. 👋')
        return
      }

      if (maybeCommand === '/showrecent') {
        const recentProducts = await getRecentProducts(5)

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
    })()
  })
}
