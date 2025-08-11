import type { InjectionKey, ShallowRef } from "vue"

export default Object.freeze({
  loginNonce: 'login.nonce',
  loginTokenBika: 'login.token.bika',
  loginDataBika: 'login.data.bika',
  loginTokenJm: 'login.token.jm',
  loginDataJm: 'login.data.jm',
  version: 'app.version',
  config: 'app.config',
  searchHistory: 'app.history.search',
  readHistory: 'app.history.read',
  r18gNotice: '\n⚠️⚠️⚠️⚠️⚠️⚠️\n此本子已被標記為重口（官方聲明）\n\n請注意，這本子的內容過於重口味，可能會使人產生惡心、頭暈等不適症狀，亦有可能使閣下情緒有負面影響，因此我們認為這個本子不適合任何人仕觀看。\n\n如閣下仍然執意決定要觀看，請閣下自行承受觀看後的後果。若有任何不適症狀，請立刻停止觀看並及時向醫師尋求幫助。 \n⚠️⚠️⚠️⚠️⚠️⚠️\n\n',
  chatToken: 'chat.login.token',
  showNavBar: <InjectionKey<ShallowRef<boolean>>>Symbol('showNavBar'),
  chatRoomTemp: 'temp.chat.room',
  chatRoomUselessSlogan: '#### **此APP為僅限成人**\n> [泡泡官网]()https://bubble.bidobido.xyz\n\n---\n\n',
  splitAuthorRegexp: /\,|，|\&|\||、|＆|(\sand\s)|(\s和\s)|(\s[xX]\s)/ig,
  sameAuthorRegexp: /\(|\)|（|）/g,
  iframeEl: <InjectionKey<ShallowRef<HTMLIFrameElement | undefined>>>Symbol('iframeEl'),
  userTemp: 'temp.user',
  comicCardMaxTagsShow: 5,
  banAi: /(^|[\(（\[\s【])ai[】\)）\]\s]?/ig
})