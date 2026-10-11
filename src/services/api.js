export async function api(path, body, signal) {
  const response = await fetch(`/api/${path}`, { method: body === undefined ? 'GET' : 'POST', headers: body === undefined ? undefined : { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal })
  if (!(response.headers.get('content-type') || '').includes('application/json')) throw new Error('服务尚未启动，可以先用本地课程练习。')
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || '连接暂时中断，请重试。')
  return data
}
