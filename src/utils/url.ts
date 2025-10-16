export const decodeURIDeep = (url: string) => {
  let last = url
  do {
    url = window.decodeURI(url)
    // if (last == url) break
    // last = url
  } while (url.includes('%'))
  return url
}
export const decodeURIComponentDeep = (url: string) => {
  let last = url
  do {
    url = window.decodeURIComponent(url)
    // if (last == url) break
    // last = url
  } while (url.includes('%'))
  return url
}