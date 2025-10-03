/// <reference types="vite/client" />

declare module 'userscript-meta' {
  type Meta = Record<string, string[] | string>
  function parse(userscript: string): Meta
  function stringify(meta: Meta): string
}