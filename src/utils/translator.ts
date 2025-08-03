import type { BKSearchMode, BKSortType } from '@/api/bika'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { Converter } from 'opencc-js'
import { computed, toRef, type MaybeRefOrGetter } from 'vue'
export const toCn = Converter({ from: 'tw', to: 'cn' })
export const toTw = Converter({ from: 'cn', to: 'tw' })
export const sorterValue: {
  text: string,
  value: BKSortType
}[] = [{ text: '新到旧', value: 'dd' }, { text: '旧到新', value: 'da' }, { text: '点赞数最多', value: 'ld' }, { text: '观看数最多', value: 'vd' }]
export const searchModeMap = {
  uploader: '@@@',
  translator: '@@',
  author: '@',
  id: '###',
  tag: '##',
  categories: '#',
  keyword: '',
  pid: 'PICA',
} as Record<BKSearchMode, string>
export const getOriginalSearchContent = (searchText: string) => {
  for (const _key in searchModeMap) {
    const key = _key as BKSearchMode
    if (Object.prototype.hasOwnProperty.call(searchModeMap, key)) {
      const signalWord = searchModeMap[key]
      searchText = searchText.replace(new RegExp(`^(${signalWord})`, 'i'), '').trim()
    }
  }
  return searchText
}
export const useSearchMode = (val: MaybeRefOrGetter<string>) => {
  const data = toRef(val)
  return computed<BKSearchMode>(() => {
    if (data.value.startsWith(searchModeMap.uploader)) return 'uploader'
    if (data.value.startsWith(searchModeMap.translator)) return 'translator'
    if (data.value.startsWith(searchModeMap.author)) return 'author'
    if (data.value.startsWith(searchModeMap.id)) return 'id'
    if (new RegExp(`^${searchModeMap.pid}`, 'ig').test(data.value)) return 'pid'
    if (data.value.startsWith(searchModeMap.tag)) return 'tag'
    if (data.value.startsWith(searchModeMap.categories)) return 'categories'
    return 'keyword'
  })
}

const translateMap: Record<string, string> = {
  knight: '骑士',
  manager: '管理者',
  vip: '会员',
  mcdonald: '金拱门',
  streamer: '主播',
  anchor: '作者',
  single_dog: '单身者',
  boy_ladies: '男娘',
  girl: '女菩萨',
  cat_lover: '猫奴',
  kfc: '肯德基',
  girl_identifier: '女菩萨审核(近水楼台先得月)',
  patrick: '派大星',
  bubble_official: '泡泡官方',
  big_boss: '核心层成员',
  official: '哔咔官方',
  test: '测试人员',
  admin: '元老',
  lunar_performer: '拜年寄成员',
  god_girl: '神之女',
  reviewer: '评论家'
}
export const userCharactersTranslator = (character: string) => Object.hasOwn(translateMap, character) ? translateMap[character] : character
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