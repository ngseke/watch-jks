import { loadStore, saveStore } from './store'

const storeName = 'receivers'

async function loadReceiversStore () {
  return (await loadStore(storeName) as number[] | undefined)
}

async function saveReceivers (receivers: Set<number>) {
  await saveStore(storeName, [...receivers])
}

export async function loadReceivers () {
  const receivers = await loadReceiversStore() ?? []
  return new Set(receivers)
}

export async function addReceiver (receiver: number) {
  const receivers = await loadReceivers()
  receivers.add(receiver)
  await saveReceivers(receivers)
}

export async function removeReceiver (receiver: number) {
  const receivers = await loadReceivers()
  receivers.delete(receiver)
  await saveReceivers(receivers)
}
