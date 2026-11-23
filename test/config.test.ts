import { expect, test } from "bun:test"
import { connectorCandidates, parsePluginConfig } from "../src/config.ts"

test("fails over only when fallbackConnector is configured", () => {
  expect(connectorCandidates("anthropic", parsePluginConfig({}))).toEqual([])
  expect(
    connectorCandidates("anthropic", parsePluginConfig({ fallbackConnector: "openai" })),
  ).toEqual(["openai"])
})

test("uses the current provider before a fallback", () => {
  expect(connectorCandidates("openai", { fallbackConnector: "openai" })).toEqual(["openai"])
})

test("accepts false to require the current connector", () => {
  expect(parsePluginConfig({ fallbackConnector: false })).toEqual({})
})

test("rejects unknown fallback connectors", () => {
  expect(() => parsePluginConfig({ fallbackConnector: "unknown" })).toThrow(
    "fallbackConnector must be false or one of: openai",
  )
})

test("accepts an OpenAI image model override with or without a fallback", () => {
  const openaiModel = "gpt-image-2.6-flare"
  expect(parsePluginConfig({ openaiModel })).toEqual({ openaiModel })
  expect(parsePluginConfig({ fallbackConnector: "openai", openaiModel })).toEqual({
    fallbackConnector: "openai",
    openaiModel,
  })
})

test("rejects invalid OpenAI image model IDs", () => {
  for (const openaiModel of [null, 26, "", "gpt-6.1-sol", "openai/gpt-image-2", "gpt-image-2\n"]) {
    expect(() => parsePluginConfig({ openaiModel })).toThrow("openaiModel must be a GPT Image model ID")
  }
})
