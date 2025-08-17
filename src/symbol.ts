import type { InjectionKey, ShallowRef } from "vue"

export default Object.freeze({
  loginNonce: 'login.nonce',
  loginTokenBika: 'login.token.bika',
  loginDataBika: 'login.data.bika',
  loginTokenJm: 'login.token.jm',
  loginAvsJm: 'login.avs.jm',
  loginDataJm: 'login.data.jm',
  config: 'app.config',
  searchHistory: 'app.history.search',
  readHistory: 'app.history.read',
  bikaR18gNotice: '\n⚠️⚠️⚠️⚠️⚠️⚠️\n此本子已被標記為重口（官方聲明）\n\n請注意，這本子的內容過於重口味，可能會使人產生惡心、頭暈等不適症狀，亦有可能使閣下情緒有負面影響，因此我們認為這個本子不適合任何人仕觀看。\n\n如閣下仍然執意決定要觀看，請閣下自行承受觀看後的後果。若有任何不適症狀，請立刻停止觀看並及時向醫師尋求幫助。 \n⚠️⚠️⚠️⚠️⚠️⚠️\n\n',
  showMainHomeNavBar: <InjectionKey<ShallowRef<boolean>>>Symbol('showNavBar'),
  splitAuthorRegexp: /\,|，|\&|\||、|＆|(\sand\s)|(\s和\s)|(\s[xX]\s)/ig,
  banAi: /(^|[\(（\[\s【])ai[】\)）\]\s]?/ig,
})