import { PluginLoader } from "../utils"
import * as fs from '@tauri-apps/plugin-fs'
import { getPluginFsPath } from "../utils"
import type { PluginArchiveDB } from "@/plugin/db"

class _PluginUserscriptLoader extends PluginLoader {
  public override async load(pluginMeta: PluginArchiveDB.Meta): Promise<any> {
    const code = await fs.readTextFile(getPluginFsPath(pluginMeta.pluginName) + '/us.js')
    const script = document.createElement('script')
    script.innerHTML = code
    document.body.appendChild(script)
  }
}

export default new _PluginUserscriptLoader