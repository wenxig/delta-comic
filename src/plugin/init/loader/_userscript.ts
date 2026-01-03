import { PluginLoader, type PluginArchiveMeta } from ".."

class _PluginUserscriptLoader extends PluginLoader {
  public override load(pluginMeta: PluginArchiveMeta): Promise<any> {
    throw new Error("Method not implemented.")
  }

}

export default new _PluginUserscriptLoader