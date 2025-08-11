import type { jm as _jm } from '..'


export const importJm = async <T extends (bika: typeof _jm) => any>(cb: T): Promise<ReturnType<T>> => {
  const { jm } = await import('..')
  return cb(jm)
}