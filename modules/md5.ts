import crypto from 'crypto'

export function md5 (data: string) {
  const hash = crypto.createHash('md5').update(data).digest('hex')
  return hash
}
