import type { cosav as _cosav } from '..'


export const importCosav = async <T extends (bika: typeof _cosav) => any>(cb: T): Promise<ReturnType<T>> => {
  const { cosav } = await import('..')
  return cb(cosav)
}