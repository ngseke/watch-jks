import express from 'express'
import { loadProducts } from './products'
import { loadReceivers } from './receivers'
const app = express()

app.get('/', async (req, res) => {
  const products = await loadProducts()
  const receivers = [...await loadReceivers()]

  res.send({ receivers, products })
})

export function startWeb () {
  app.listen(8080)
}
