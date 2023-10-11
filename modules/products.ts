import { loadStore, saveStore } from './store'

const storeName = 'products'

type ProductLink = string
export interface Product {
  key: string
  link: ProductLink
  img: string
  name: string
  price: number
  crawledAt: number
}
export type Products = Record<ProductLink, Product>

async function loadProductsStore () {
  return (await loadStore(storeName) as Products | undefined)
}

async function saveProducts (products: Products) {
  await saveStore(storeName, products)
}

export async function loadProducts () {
  const products = await loadProductsStore() ?? {}
  return products
}

export async function loadRecentProducts (limit = Infinity) {
  const products = await loadProducts()
  return Object.values(products)
    .sort((a, b) => b.crawledAt - a.crawledAt)
    .slice(0, limit)
}

export async function addProduct (product: Product) {
  const products = await loadProducts()
  const key = product.link

  if (key in products) {
    return { isExists: true }
  }

  products[key] = product
  await saveProducts(products)

  return { isExists: false }
}
