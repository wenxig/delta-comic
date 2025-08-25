import type { bika } from '@/api/bika'
import type { cosav } from '@/api/cosav'
import type { jm } from '@/api/jm'
import type { uni } from '@/api/union'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { Converter } from 'opencc-js'
import { computed, toRef, type MaybeRefOrGetter } from 'vue'
export const toCn = Converter({ from: 'tw', to: 'cn' })
export const toTw = Converter({ from: 'cn', to: 'tw' })

export const bikaSorterValue: {
  text: string,
  value: bika.SortType
}[] = [{ text: '新到旧', value: 'dd' }, { text: '旧到新', value: 'da' }, { text: '点赞数最多', value: 'ld' }, { text: '观看数最多', value: 'vd' }]
export const jmSorterValue: {
  text: string,
  value: jm.SortType
}[] = [
    { text: '相关性最高', value: '' }, { text: '点赞数最多', value: 'tf' }, { text: '图片数最多', value: 'mp' },
    { text: '观看数最多', value: 'mv' }, { text: '本月观看数最多', value: 'mv_m' }, { text: '本周观看数最多', value: 'mv_w' }, { text: '今日观看数最多', value: 'mv_t' }]
export const cosavSorterValue: {
  text: string,
  value: cosav.SortType
}[] = [
    { text: '相关性最高', value: '' }, { text: '观看数最多', value: 'mv' }, { text: '新到旧', value: 'mr' }]

export const searchModeMap = {
  uploader: '@',
  tag: '##',
  category: '#',
  keyword: '',
  pid: 'PICA',
  jid: 'JM'
} as Record<uni.SearchMode, string>
export const getOriginalSearchContent = (searchText: string) => {
  for (const _key in searchModeMap) {
    const key = _key as uni.SearchMode
    if (Object.prototype.hasOwnProperty.call(searchModeMap, key)) {
      const signalWord = searchModeMap[key]
      searchText = searchText.replace(new RegExp(`^(${signalWord})`, 'i'), '').trim()
    }
  }
  return searchText
}
export const useSearchMode = (val: MaybeRefOrGetter<string>) => {
  const data = toRef(val)
  return computed<uni.SearchMode>(() => {
    if (data.value.startsWith(searchModeMap.uploader)) return 'uploader'
    if (data.value.startsWith(searchModeMap.jid)) return 'jid'
    if (data.value.startsWith(searchModeMap.jid.toLocaleLowerCase())) return 'jid'
    if (data.value.startsWith(searchModeMap.pid)) return 'pid'
    if (data.value.startsWith(searchModeMap.pid.toLocaleLowerCase())) return 'pid'
    if (data.value.startsWith(searchModeMap.tag)) return 'tag'
    if (data.value.startsWith(searchModeMap.category)) return 'category'
    return 'keyword'
  })
}

const bikaCharTranslateMap: Record<string, string> = {
  knight: '骑士',
  manager: '管理者',
  vip: '会员',
  mcdonald: '麦当劳',
  streamer: '主播',
  anchor: '作者',
  single_dog: '单身者',
  boy_ladies: '男娘',
  girl: '女菩萨',
  cat_lover: '猫奴',
  kfc: '肯德基',
  girl_identifier: '女菩萨审核',
  patrick: '派大星',
  bubble_official: '泡泡官方',
  big_boss: '核心层成员',
  official: '哔咔官方',
  test: '测试人员',
  admin: '管理员',
  lunar_performer: '拜年寄成员',
  god_girl: '女神',
  reviewer: '评论家'
}
export const userCharactersTranslator = (character: string) => Object.hasOwn(bikaCharTranslateMap, character) ? bikaCharTranslateMap[character] : character
export const createDateString = (date: Dayjs = dayjs()) => {
  const today = dayjs()
  const isThisYear = date.isSame(today, 'year')
  const isInSameMonth = isThisYear && date.isSame(today, 'month')
  const isToday = isInSameMonth && date.daysInMonth() == today.daysInMonth()
  const isLastDay = isInSameMonth && date.daysInMonth() == today.daysInMonth() - 1
  const isLastLastDay = isInSameMonth && date.daysInMonth() == today.daysInMonth() - 2
  let format = ''
  if (!isThisYear) format += 'YYYY年 '
  if (isToday) format += '今天 '
  else if (isLastDay) format += '昨天 '
  else if (isLastLastDay) format += '前天 '
  else format += 'M月D日 '
  format += 'HH:mm'
  return date.format(format)
}
export const imageQualityMap: Record<bika.ImageQuality, string> = {
  low: '标清',
  medium: '高清',
  high: '超清',
  original: '大清'
}