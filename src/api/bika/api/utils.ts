import type { bika as _bk } from '..'


export const importBika = async <T extends (bika: typeof _bk) => any>(cb: T): Promise<ReturnType<T>> => {
  const { bika } = await import('..')
  return cb(bika)
}