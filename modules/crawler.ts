import axios from 'axios'
import { JSDOM } from 'jsdom'
import { Product } from '../types/Product'
import { md5 } from './md5'

let crawledAt: number = 0

export function getCrawledAt () {
  return crawledAt
}

export function parseProductSlug (link: string) {
  const matcher = /\/products\/(.+)/
  return link.match(matcher)?.[1] ?? md5(link)
}

/**
 * Parse the raw price string into a number.
 * The raw price string might look like:
 *   - "NT$1,080"
 *   - "NT$680 ~ NT$780"
 */
export function parseProductPrice (rawPrice: string | null | undefined) {
  rawPrice ??= ''
  const [firstRawPrice] = rawPrice?.split('~')
  return Number(firstRawPrice?.replaceAll('NT$', '').replaceAll(',', '')) ?? 0
}

export async function crawl () {
  const html = (await axios.get('https://www.jksshop.co/categories/jks-new-arrival?page=1&sort_by=created_at&order_by=desc&limit=100')).data as string
  const dom = new JSDOM(html)

  const productElements = [...dom.window.document.querySelectorAll('product-item')]

  crawledAt = +new Date()

  const products = productElements.map<Product>((el) => {
    const $ = (selector: string) => el.querySelector(selector)

    const name = $('.title')?.textContent ?? '-'
    const rawPrice = $('.price:not(.price-crossed)')?.textContent
    const price = parseProductPrice(rawPrice)
    const link = $('a')?.getAttribute('href') ?? '-'
    const key = parseProductSlug(link)
    const srcSetString = $('.boxify-image img')?.getAttribute('data-srcset')
    const img = srcSetString?.split('?')[0] ?? ''

    return { key, name, price, link, img, crawledAt }
  })

  return products
}
