import { ref, set, get, child, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database'
import { Product } from './products'
import { firebaseDatabase } from './firebase'

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

export async function checkSubscriberExists (id: number) {
  const snapshot = await get(child(subscribersRef, String(id)))
  return snapshot.exists()
}

export async function getSubscriber (id: number) {
  const snapshot = await get(child(subscribersRef, String(id)))
  return snapshot.val() as Record<string, any>
}

export async function getAllSubscriberIds () {
  const snapshot = await get(subscribersRef)
  const ids: number[] = []
  snapshot.forEach(({ key }) => {
    ids.push(Number(key))
  })
  return ids
}

export async function addSubscriber (id: number) {
  const exists = await checkSubscriberExists(id)
  if (exists) return false
  await set(child(subscribersRef, String(id)), {
    subscribedAt: serverTimestamp(),
  })
  return true
}

export async function removeSubscriber (id: number) {
  await set(child(subscribersRef, String(id)), null)
}
