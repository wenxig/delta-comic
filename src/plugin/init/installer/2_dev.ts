import type { PluginArchiveDB } from "@/plugin/db"
import { PluginInstaller } from ".."
import { decodePluginMeta, Utils } from "delta-comic-core"
import axios from "axios"
import * as fs from '@tauri-apps/plugin-fs'
import { parse } from 'userscript-meta'
import { getPluginFsPath } from "../utils"

export class _PluginInstallByDev extends PluginInstaller {
  public override name = 'devUrl'
  private async installer(input: string, { createLoading, createProgress }: Utils.message.DownloadMessageBind) {
    const code = await createProgress('下载插件中', async c => {
      c.retryable = true
      c.description = '下载中'
      const res = await axios.request<string>({
        url: input,
        responseType: 'text',
        onDownloadProgress: progressEvent => {
          if (!progressEvent.lengthComputable) c.progress = 100
          else c.progress = progressEvent.loaded / progressEvent.total! * 100
        }
      })
      return res.data
    })
    const meta = decodePluginMeta(parse(code))
    await createLoading('写入文件系统', async c => {
      c.retryable = true
      c.description = '写入中'
      const path = getPluginFsPath(meta.name.id)
      fs.writeTextFile(`${path}/us.js`, code, { create: true })
    })
    return meta
  }
  public override async install(input: string): Promise<PluginArchiveDB.Meta> {
    const meta = await Utils.message.createDownloadMessage('下载插件-回退URL', m => this.installer(input, m))
    return {
      enable: true,
      installerName: this.name,
      installInput: input,
      loaderName: 'userscript',
      meta,
      pluginName: meta.name.id,
      displayName: meta.name.display
    }
  }
  public override async update(pluginMeta: PluginArchiveDB.Meta): Promise<PluginArchiveDB.Meta> {
    const meta = await Utils.message.createDownloadMessage('更新插件-回退URL', m => this.installer(pluginMeta.installInput, m))
    return {
      ...pluginMeta,
      meta,
      displayName: meta.name.display
    }
  }
  public override isMatched(input: string): boolean {
    return /(\d+\.?)+/.test(input)
  }

}

export default new _PluginInstallByDev