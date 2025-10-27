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

interface LoginData {
  lastLogin: string
  loginCount: number
}

const loginDataCache = new Map<string, LoginData>()

async function getLoginData(id: string) {
  const cache = loginDataCache.get(id)
  if (cache) return cache

  const data: LoginData = (await request('query FIND_USERSTATUS_BY_USERNAME($id:String){userstatus(id:$id){lastLogin,loginCount}}', {
    id,
  })).data.userstatus

  loginDataCache.set(id, data)
  return data
}

async function addProfileData(container: Element, label: string, content: string | Promise<string>) {
  const span = container.appendChild(document.createElement('span'))
  span.textContent = label

  const em = span.appendChild(document.createElement('em'))
  em.textContent = await content
}

new MutationObserver(() => {
  const div = document.querySelector('.e1e59sjh1')
  if (!div || (div as any).__createdSuggestionItem) return
  ;(div as any).__createdSuggestionItem = true

  const data = getLoginData(location.pathname.match(/[0-9a-f]{24}/)?.[0]!)

  addProfileData(div, '로그인 횟수 ', data.then(({ loginCount }) => loginCount + ''))
  addProfileData(div, '최종 로그인 ', data.then(({ lastLogin }) => new Date(lastLogin).toLocaleDateString()))
}).observe(document, { childList: true, subtree: true })
