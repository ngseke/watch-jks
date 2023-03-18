import { emptyDir, ensureFile, readJSON, writeJSON } from 'fs-extra'
import { resolve } from 'path'

export const folder = './store'

const getStoreFileName = (storeName: string) => `${storeName}.json`

export async function loadStore (storeName: string) {
  const path = resolve(folder, getStoreFileName(storeName))

  try {
    await ensureFile(path)
    return (await readJSON(path)) as unknown
  } catch (err) {
  }
}

export async function saveStore (storeName: string, content: any) {
  const path = resolve(folder, getStoreFileName(storeName))
  await writeJSON(path, content)
}

export async function clearAllStores () {
  await emptyDir(folder)
}
