import Index from "@/components/comment/index.vue"
import FavouriteSelect from "@/components/favouriteSelect.vue"
import UnitCard from "@/components/unitCard.vue"
import { imageViewConfig } from "@/config"
import { SubscribeDb, subscribeDb } from "@/db/subscribe"
import Default from "@/pages/content/layout/default.vue"
import Images from "@/pages/content/layout/view/images.vue"
import Videos from "@/pages/content/layout/view/videos.v.vue"
import { definePlugin, Store, Utils, } from "delta-comic-core"
export const $initCore = () => definePlugin({
  name: 'core',
  config: [
    Store.appConfig,
    imageViewConfig
  ],
  onBooted: () => {
    Utils.eventBus.SharedFunction.define(async (author, plugin) => {
      const count = await subscribeDb.all.where('key').equals(SubscribeDb.createKey(plugin, author.label)).count()
      return count > 0
    }, 'core', 'getIsAuthorSubscribe')
    Utils.eventBus.SharedFunction.define(async (author, plugin) => {
      await subscribeDb.all.put({
        key: SubscribeDb.createKey(plugin, author.label),
        author,
        plugin,
        type: 'author'
      })
      return
    }, 'core', 'addAuthorSubscribe')
    Utils.eventBus.SharedFunction.define(async (author, plugin) => {
      await subscribeDb.all.delete(SubscribeDb.createKey(plugin, author.label))
      return
    }, 'core', 'removeAuthorSubscribe')
    return {
      layout: {
        Default
      },
      view: {
        Images,
        Video: Videos,
        Videos
      },
      comp: {
        Comment: Index,
        ItemCard: UnitCard,
        FavouriteSelect: FavouriteSelect
      }
    }
  }
})
