// UUID 生成：优先使用 Web Crypto 的 randomUUID（secure context 可用），
// 非安全上下文（如手机经局域网 IP 的 http:// 访问）下回退到 RFC4122 风格随机值。
export function uuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // RFC4122 v4 fallback（不依赖 crypto API，任何浏览器都可用）
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
