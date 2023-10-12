import { ref, set, get, child, query, orderByChild, limitToLast } from 'firebase/database'
import { Product } from '../types/Product'
import { firebaseDatabase } from './firebase'
import { Subscriber } from '../types/Subscriber'

const productsRef = ref(firebaseDatabase, 'products')

export const productsCache = new Map<string, Product>()

export async function initProductsCache () {
  const products = await getAllProducts()
  Object.entries(products)
    .forEach(([key, value]) => productsCache.set(key, value))
}

export async function checkProductExists (key: string) {
  if (productsCache.has(key)) return true
  const snapshot = await get(child(productsRef, key))
  return snapshot.exists()
}

export async function addProductFirebase (product: Product) {
  const { key } = product
  const exists = await checkProductExists(key)
  if (exists) return false

  productsCache.set(key, product)
  await set(child(productsRef, key), product)
  return true
}

export async function getAllProducts () {
  const snapshot = await get(productsRef)
  return snapshot.val() as Record<string, Product>
}

export async function getRecentProducts (limit = 5) {
  const sortedRef = query(
    productsRef,
    orderByChild('crawledAt'),
    limitToLast(limit)
  )
  const snapshot = await get(sortedRef)
  const products: Product[] = []
  snapshot.forEach(child => {
    products.push(child.val())
  })
  return products.reverse()
}

const subscribersRef = ref(firebaseDatabase, 'subscribers')

/**
 * Create a record for the user first regardless of whether they want to subscribe or not
 *
 * @returns `true` if a new subscriber record is created; `false` if the record already exists
 */
export async function ensureSubscriber (id: number) {
  const snapshot = await get(child(subscribersRef, String(id)))
  const exists = snapshot.exists()
  if (exists) return false

  const body: Subscriber = {
    subscribedAt: +new Date(),
    isSubscribed: false,
  }
  await set(child(subscribersRef, String(id)), body)
  return true
}

export async function getSubscriber (id: number) {
  await ensureSubscriber(id)
  const snapshot = await get(child(subscribersRef, String(id)))
  return snapshot.val() as Subscriber
}

export async function getAllSubscribedSubscriberIds () {
  const snapshot = await get(subscribersRef)
  const ids: number[] = []
  snapshot.forEach((child) => {
    const value = child.val() as Subscriber
    if (value.isSubscribed) {
      ids.push(Number(child.key))
    }
  })

  return ids
}

export async function addSubscriber (id: number) {
  await ensureSubscriber(id)
  await setSubscriberIsSubscribed(id, true)
}

export async function removeSubscriber (id: number) {
  await ensureSubscriber(id)
  await setSubscriberIsSubscribed(id, false)
}

export async function setSubscriberIsSubscribed (
  id: number,
  isSubscribed: boolean
) {
  const ref = child(subscribersRef, `${String(id)}/isSubscribed`)
  await set(ref, isSubscribed)
}
