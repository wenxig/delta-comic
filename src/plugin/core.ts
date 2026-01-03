import CommentRow from "@/components/comment/commentRow.vue"
import Index from "@/components/comment/index.vue"
import FavouriteSelect from "@/components/favouriteSelect.vue"
import UnitCard from "@/components/unitCard.vue"
import { imageViewConfig } from "@/config"
import { subscribeKey, SubscribeDb } from "@/db/subscribe"
import Default from "@/pages/content/layout/default.vue"
import Images from "@/pages/content/layout/view/images.vue"
import Videos from "@/pages/content/layout/view/videos.v.vue"
import { TagOutlined } from "@vicons/antd"
import { definePlugin, Store, uni, Utils, } from "delta-comic-core"
import { shareText } from "@buildyourwebapp/tauri-plugin-sharesheet"
import { compress, decompress } from 'lz-string'
import { usePluginStore } from "./store"
import { OfflineShareRound } from "@vicons/material"
export const $initCore = () => definePlugin({
  name: 'core',
  config: [
    Store.appConfig,
    imageViewConfig
  ],
  onBooted: () => {
    Utils.eventBus.SharedFunction.define(async (author, plugin) => {
      const count = (await SubscribeDb.getByQuery('key = $1', [subscribeKey.toString([plugin, author.label])])).length
      return count > 0
    }, 'core', 'getIsAuthorSubscribe')
    Utils.eventBus.SharedFunction.define(async (author, plugin) => {
      await SubscribeDb.upsertItem({
        key: subscribeKey.toString([plugin, author.label]),
        author,
        plugin,
        type: 'author'
      })
      return
    }, 'core', 'addAuthorSubscribe')
    Utils.eventBus.SharedFunction.define(async (author, plugin) => {
      await SubscribeDb.removeItem([plugin, author.label])
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
        const item = page.union.value!.toJSON()
        const compressed = compress(JSON.stringify(<CorePluginTokenShareMeta>{
          item: {
            contentType: uni.content.ContentPage.contentPage.toString(item.contentType),
            ep: item.thisEp.index,
            name: item.title
          },
          plugin: page.plugin,
          id: page.id
        }))
        await Utils.eventBus.SharedFunction.call('pushShareToken', `[${page.union.value?.title}](复制这条口令，打开Delta Comic)${compressed}`)
      }
    }, {
      filter: () => true,
      icon: OfflineShareRound,
      key: 'native',
      name: '原生分享',
      async call(page) {
        const item = page.union.value!.toJSON()
        const compressed = compress(JSON.stringify(<CorePluginTokenShareMeta>{
          item: {
            contentType: uni.content.ContentPage.contentPage.toString(item.contentType),
            ep: item.thisEp.index,
            name: item.title
          },
          plugin: page.plugin,
          id: page.id
        }))
        const token = `[${page.union.value?.title}](复制这条口令，打开Delta Comic)${compressed}`
        await shareText(token, {
          title: 'Delta Comic内容分享',
        })
      }
    }],
    tokenListen: [{
      key: 'token',
      name: '默认口令',
      patten(chipboard) {
        return /^\[.+\]\(复制这条口令，打开Delta Comic\).+/.test(chipboard)
      },
      show(chipboard) {
        const pluginStore = usePluginStore()
        const meta: CorePluginTokenShareMeta = JSON.parse(decompress(chipboard.replace(/^\[.+\]/, '').replaceAll('(复制这条口令，打开Delta Comic)', '')))
        return {
          title: '口令',
          detail: `发现分享的内容: ${meta.item.name}，需要的插件: ${pluginStore.$getPluginDisplayName(meta.plugin)}`,
          onNegative() { },
          onPositive() {
            Utils.eventBus.SharedFunction.call('routeToContent', meta.item.contentType, meta.id, meta.item.ep)
          },
        }
      },
    }]
  },
  search: {

  }
})
interface CorePluginTokenShareMeta {
  item: {
    name: string
    contentType: string
    ep: string
  }
  plugin: string
  id: string
}
