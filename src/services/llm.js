// AI 服务前端适配层：所有调用都走同源 /api 代理，
// DeepSeek 密钥只存在于服务端（server/.env），不再打包进前端 bundle。
import { api } from './api.js'

export async function checkStatus(signal) {
  try {
    const data = await api('status', undefined, signal)
    return data?.articleConnected === true
  } catch {
    return false
  }
}

/** 与旧调用方兼容的同步判断（服务端已连接即视为可用，未连接会由接口报错并回退本地课程） */
export function articleConnected() {
  return true
}

const list = (value, limit = 100) => Array.isArray(value) ? value.filter(x => typeof x === 'string').slice(0, limit).map(x => x.slice(0, 80)) : []

export async function generateArticle(body, signal) {
  // 服务端已做格式校验并返回可直接使用的课程对象
  return api('generate-article', body, signal)
}

export async function explainWord({ word, context }, signal) {
  return api('explain', { word, sentence: context }, signal)
}

export async function coach(body, signal, onDelta) {
  const data = await api('coach', body, signal)
  const reply = String(data?.reply || '')
  if (!reply.trim()) throw new Error('AI没有返回有效内容，请重试')
  if (typeof onDelta === 'function') onDelta(reply)
  return { reply }
}

// 保留：SSE 事件流解析（供测试与未来流式接口使用）
export async function readEventStream(response, onDelta) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (!data || data === '[DONE]') continue
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta?.content
        if (typeof delta === 'string' && delta) onDelta(delta)
      } catch { /* ignore a non-JSON keep-alive line */ }
    }
  }
}

export { list }
