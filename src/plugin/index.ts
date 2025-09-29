import { Utils } from "delta-comic-core"
import { usePluginStore } from "./store"
const { SharedFunction } = Utils.eventBus

SharedFunction.define(async cfg => {
  const store = usePluginStore()
  store.$addPlugin(cfg)
}, 'core', 'addPlugin')