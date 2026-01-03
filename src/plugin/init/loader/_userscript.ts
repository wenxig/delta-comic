import { PluginLoader } from ".."
import * as fs from '@tauri-apps/plugin-fs'
import { getPluginFsPath } from "./utils"
import type { PluginArchiveMeta } from "@/plugin/db"

class _PluginUserscriptLoader extends PluginLoader {
  public override async load(pluginMeta: PluginArchiveMeta): Promise<any> {
    const code = await fs.readTextFile(getPluginFsPath(pluginMeta.pluginName))
    const script = document.createElement('script')
    script.innerHTML = code
    document.body.appendChild(script)
  }
}

export default new _PluginUserscriptLoader