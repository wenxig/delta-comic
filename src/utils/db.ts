import { shallowRef, watchEffect, onUnmounted, shallowReadonly } from "vue"

export function useLiveQueryRef<T>(queryFn: () => Promise<T> | T, initial: T, db: { onChange: (cb: () => void) => (() => void) }) {
  const data = shallowRef(initial)
  const unsubscribe = db.onChange(async () => {
    data.value = await queryFn()
  })
  const watcher = watchEffect(async () => {
    data.value = await queryFn()
  })
  onUnmounted(() => {
    unsubscribe()
    watcher.stop()
  })
  return shallowReadonly(data)
}