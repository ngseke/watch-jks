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
