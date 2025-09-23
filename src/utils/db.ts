import { liveQuery } from "dexie"
import { shallowRef, onUnmounted, shallowReadonly } from "vue"

export function useLiveQueryRef<T>(queryFn: () => Promise<T> | T, initial: T) {
  const data = shallowRef(initial)
  const sub = liveQuery(queryFn).subscribe({
    next: (v: T) => data.value = v,
    error: (e: any) => console.error(e)
  })
  onUnmounted(() => sub.unsubscribe())
  return shallowReadonly(data)
}