import { liveQuery } from "dexie"
import { shallowRef, watchEffect, onUnmounted, shallowReadonly, watch } from "vue"

export function useLiveQueryRef<T>(queryFn: () => Promise<T> | T, initial: T) {
  const data = shallowRef(initial)
  if (import.meta.env.DEV) {
    watch(data, (v, ov) => {
      console.log('[useLiveQueryRef]', v, ov, queryFn, initial)
    }, { immediate: true })
  }
  const sub = liveQuery(queryFn).subscribe({
    next: (v: T) => data.value = v,
    error: (e: any) => console.error(e)
  })
  const watcher = watchEffect(async () => {
    data.value = await queryFn()
  })
  onUnmounted(() => {
    sub.unsubscribe()
    watcher.stop()
  })
  return shallowReadonly(data)
}