import * as Vue from 'vue'
window.$$lib$$.Vue = Vue
import * as Vant from 'vant'
window.$$lib$$.Vant = Vant
import * as Naive from 'naive-ui'
window.$$lib$$.Naive = Naive
import * as Motion from 'motion-v'
window.$$lib$$.Motion = Motion
import * as Axios from 'axios'
import axios from 'axios'
window.$$lib$$.Axios = { ...Axios, ...axios, axios }
import * as Lodash from 'lodash-es'
window.$$lib$$.Lodash = Lodash
import * as Dcc from 'delta-comic-core'
window.$$lib$$.Dcc = Dcc
import * as Vr from 'vue-router'
window.$$lib$$.VR = Vr
import * as Pinia from 'pinia'
window.$$lib$$.Pinia = Pinia
import Crypto from 'crypto-js'
window.$$lib$$.Crypto = Crypto

import DefaultLayout from './pages/content/layout/default.vue'
window.$layout.default = DefaultLayout