async function request(query: string, variables: object) {
  const __NEXT_DATA__ = JSON.parse(document.getElementById('__NEXT_DATA__')?.textContent || '')
  const { props: { initialProps: { csrfToken }, pageProps: { initialState: { common: { user } } } } } = __NEXT_DATA__

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Csrf-Token': csrfToken,
  })
  if (user) headers.set('X-Token', user.xToken)

  const res = await fetch('/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

const loginCountCache = new Map<string, number>()

async function getLoginCount(id: string) {
  if (loginCountCache.has(id)) return loginCountCache.get(id)

  const loginCount = (await request('query FIND_USERSTATUS_BY_USERNAME($id:String){userstatus(id:$id){loginCount}}', {
    id,
  })).data.userstatus.loginCount

  loginCountCache.set(id, loginCount)
  return loginCount
}

new MutationObserver(async () => {
  const div = document.querySelector('.e1e59sjh1')
  if (!div || (div as any).__createdSuggestionItem) return
  ;(div as any).__createdSuggestionItem = true

  const span = div.appendChild(document.createElement('span'))
  span.textContent = '로그인 횟수 '

  const em = span.appendChild(document.createElement('em'))
  em.textContent = await getLoginCount(location.pathname.match(/[0-9a-f]{24}/)?.[0]!)
}).observe(document, { childList: true, subtree: true })
