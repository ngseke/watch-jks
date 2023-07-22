import dayjs from 'dayjs'
import TelegramBot from 'node-telegram-bot-api'
import { TELEGRAM_BOT_TOKEN } from './constants'
import { getCrawledAt } from './crawler'
import { loadProducts, loadRecentProducts, Product } from './products'
import { addReceiver, loadReceivers, removeReceiver } from './receivers'

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

export async function sendToAllReceiver (product: Product) {
  const receivers = await loadReceivers()

  return await Promise.allSettled(
    [...receivers].map(async chatId => {
      await send(chatId, product)
    })
  )
}
export async function sendRestartedMessageToAllReceiver () {
  const receivers = await loadReceivers()

  ;[...receivers].forEach((receiver) => {
    bot.sendMessage(
      receiver,
      '<i>Bot restarted.</i>',
      { parse_mode: 'HTML' }
    )
  })
}

const getDefaultMessage = async (chatId: number) => {
  const receivers = await loadReceivers()
  const isSubscribed = receivers.has(chatId)

  const subscribeStatusMessage = isSubscribed
    ? `\n✅ You are already subscribed. <i>(id: ${chatId})</i>`
    : '\n\n💡 Type /subscribe to subscribe now!'

  const crawledAt = getCrawledAt()
  const crawledAtMessage = crawledAt
    ? `\n⏰ Last crawled at: <b>${formatDateTime(crawledAt)}</b>`
    : ''

  const products = (await loadProducts())
  const count = Object.keys(products).length
  const countMessage = count
    ? `\n⏰ Crawled products count: <b>${count}</b>`
    : ''

  return [
    '🐟 Hi, I\'m Watch JKS Bot\n',
    countMessage,
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
        await addReceiver(chatId)
        await bot.sendMessage(chatId, 'You have successfully subscribed. 🎉')
        return
      }

      if (maybeCommand === '/unsubscribe') {
        await removeReceiver(chatId)
        await bot.sendMessage(chatId, 'See you later. 👋')
        return
      }

      if (maybeCommand === '/showrecent') {
        const recentProducts = await loadRecentProducts(5)

        await Promise.allSettled(
          recentProducts.map((product) => send(chatId, product))
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

  sendRestartedMessageToAllReceiver()
}
