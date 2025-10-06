import { liveQuery } from "dexie"
import { shallowRef, watchEffect, onUnmounted, shallowReadonly } from "vue"

export function useLiveQueryRef<T>(queryFn: () => Promise<T> | T, initial: T) {
  const data = shallowRef(initial)
  const sub = liveQuery(queryFn).subscribe({
    next: (v: T) => data.value = v,
    error: (e: any) => console.error(e)
  })
  const watcher = watchEffect(() => {
    Promise.try(queryFn).then(v => data.value = v)
  })
  onUnmounted(() => {
    sub.unsubscribe()
    watcher.stop()
  })
  return shallowReadonly(data)
}