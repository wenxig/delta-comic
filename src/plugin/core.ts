import Index from "@/components/comment/index.vue"
import FavouriteSelect from "@/components/favouriteSelect.vue"
import UnitCard from "@/components/unitCard.vue"
import { imageViewConfig } from "@/config"
import Default from "@/pages/content/layout/default.vue"
import Images from "@/pages/content/layout/view/images.vue"
import { definePlugin, Store, } from "delta-comic-core"
export const $initCore = () => definePlugin({
  name: 'core',
  config: [
    Store.appConfig,
    imageViewConfig
  ],
  onBooted: () => ({
    layout: {
      Default
    },
    view: {
      Images
    },
    comp: {
      Comment: Index,
      ItemCard: UnitCard,
      FavouriteSelect: FavouriteSelect
    }
  })
})
