export const CONNECTOR_IDS = ["openai", "xai"] as const
export const DEFAULT_OPENAI_MODEL = "gpt-image-2.6-sunburst"

export type ConnectorId = (typeof CONNECTOR_IDS)[number]

export interface PluginConfig {
  fallbackConnector?: ConnectorId
  openaiModel?: string
}

const isConnectorId = (value: string): value is ConnectorId =>
  (CONNECTOR_IDS as readonly string[]).includes(value)

export const parsePluginConfig = (options: Readonly<Record<string, unknown>>): PluginConfig => {
  const config: PluginConfig = {}
  if (options.openaiModel !== undefined) {
    if (typeof options.openaiModel !== "string" || options.openaiModel !== options.openaiModel.trim() ||
        !/^gpt-image-[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(options.openaiModel)) {
      throw new Error("openaiModel must be a GPT Image model ID, such as gpt-image-2.6-sunburst.")
    }
    config.openaiModel = options.openaiModel
  }
  const fallback = options.fallbackConnector
  if (fallback === undefined || fallback === null || fallback === false) {
    return config
  }
  if (typeof fallback !== "string" || !isConnectorId(fallback)) {
    throw new Error(
      `fallbackConnector must be false or one of: ${CONNECTOR_IDS.join(", ")}.`,
    )
  }
  return { ...config, fallbackConnector: fallback }
}

export const connectorCandidates = (
  currentProvider: string | undefined,
  config: PluginConfig,
): ConnectorId[] => {
  const result: ConnectorId[] = []
  if (currentProvider && isConnectorId(currentProvider)) result.push(currentProvider)
  if (config.fallbackConnector && !result.includes(config.fallbackConnector)) {
    result.push(config.fallbackConnector)
  }
  return result
}
