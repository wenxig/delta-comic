import CommentRow from "@/components/comment/commentRow.vue"
import Index from "@/components/comment/index.vue"
import FavouriteSelect from "@/components/favouriteSelect.vue"
import UnitCard from "@/components/unitCard.vue"
import { imageViewConfig } from "@/config"
import { subscribeKey, subscribeDb } from "@/db/subscribe"
import Default from "@/pages/content/layout/default.vue"
import Images from "@/pages/content/layout/view/images.vue"
import Videos from "@/pages/content/layout/view/videos.v.vue"
import { TagOutlined } from "@vicons/antd"
import { definePlugin, Store, uni, Utils, } from "delta-comic-core"

import { Clipboard } from '@capacitor/clipboard'
import { compress } from 'lz-string'
export const $initCore = () => definePlugin({
  name: 'core',
  config: [
    Store.appConfig,
    imageViewConfig
  ],
  onBooted: () => {
    Utils.eventBus.SharedFunction.define(async (author, plugin) => {
      const count = await subscribeDb.all.where('key').equals(subscribeKey.toString([plugin, author.label])).count()
      return count > 0
    }, 'core', 'getIsAuthorSubscribe')
    Utils.eventBus.SharedFunction.define(async (author, plugin) => {
      await subscribeDb.$add({
        key: subscribeKey.toString([plugin, author.label]),
        author,
        plugin,
        type: 'author'
      })
      return
    }, 'core', 'addAuthorSubscribe')
    Utils.eventBus.SharedFunction.define(async (author, plugin) => {
      await subscribeDb.$remove({
        key: subscribeKey.toString([plugin, author.label]),
        author,
        plugin,
        type: 'author'
      })
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
        FavouriteSelect: FavouriteSelect,
        CommentRow: CommentRow
      }
    }
  },
  share: {
    initiative: [{
      filter: () => true,
      icon: TagOutlined,
      key: 'token',
      bgColor: '#cccc33',
      name: '口令',
      async call(page) {
        const compressed = compress(`${uni.content.ContentPage.contentPage.toString(page.contentType)}#${page.id}#${JSON.stringify(page.union.value?.thisEp)}`)
        Clipboard.write({
          string: `[${page.union.value?.title}]${compressed}(复制这条口令，打开Delta Comic)`
        })
      }
    }],
    tokenListen: []
  }
})
