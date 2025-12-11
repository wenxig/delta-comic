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
import { compressToBase64, decompressFromBase64 } from 'lz-string'
import { usePluginStore } from "./store"
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
      name: '复制口令',
      async call(page) {
        const compressed = compressToBase64(JSON.stringify(<CorePluginTokenShareMeta>{
          item: page.union.value!.toJSON(),
          plugin: page.plugin,
          id: page.id
        }))
        await Clipboard.write({
          string: `[${page.union.value?.title}]${compressed}(复制这条口令，打开Delta Comic)`
        })
        window.$message.success('复制成功')
      }
    }],
    tokenListen: [{
      key: 'token',
      name: '口令',
      patten(chipboard) {
        return /^\[.+\][A-Z0-9a-z\+\/]+=*\(复制这条口令，打开Delta Comic\)/.test(chipboard)
      },
      show(chipboard) {
        const pluginStore = usePluginStore()
        const meta: CorePluginTokenShareMeta = JSON.parse(decompressFromBase64(chipboard.replace(/^\[.+\]/, '').replaceAll('(复制这条口令，打开Delta Comic)', '')))
        return {
          title: '口令',
          detail: `发现分享的内容: ${meta.item.title}，需要的插件: ${pluginStore.$getPluginDisplayName(meta.plugin)}`,
          onNegative() { },
          onPositive() {
            Utils.eventBus.SharedFunction.call('routeToContent', meta.item.contentType, meta.id, meta.item.thisEp.index, uni.item.Item.create(meta.item))
          },
        }
      },
    }]
  }
})
export interface CorePluginTokenShareMeta {
  item: uni.item.RawItem
  plugin: string
  id: string
}
