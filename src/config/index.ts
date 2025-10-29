import { Device } from '@capacitor/device'
import { Capacitor } from "@capacitor/core"
import { Store } from 'delta-comic-core'

export const deviceInfo = Capacitor.isNativePlatform() ? await Device.getInfo() : undefined

export const imageViewConfig = new Store.ConfigPointer('core.view.image', {
  doubleImage: {
    type: 'switch',
    defaultValue: false,
    info: '同时显示两个图片'
  },
  preloadImages: {
    type: 'number',
    defaultValue: 2,
    info: '图片前后预加载数量',
    range: [1, 10],
    float: false
  },
})