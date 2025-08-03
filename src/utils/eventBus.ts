import mitt from "mitt"

export type EventBus = {
  networkError_unauth: any
  networkError_response: any
  networkError_emptyData: any
  networkError_request: any
}
export default mitt<EventBus>()
