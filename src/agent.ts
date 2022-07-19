import superagent from 'superagent'

//const superagent = superagentPromise(_superagent, global.Promise);
console.log(process.env.NODE_ENV)
const API_ROOT = process.env.NODE_ENV !== 'production' ? 'http://localhost:3001/api' : 'https://henbane.netlify.app/api'//https://henbane.netlify.app/, https://henbane-demo.herokuapp.com/

const encode = encodeURIComponent
const responseBody = (res: any) => res.body    

let token: string = ''
const tokenPlugin = (req: any) => {
  if (token && token.length > 0)
  {
      req.set('authorization', `Token: ${token}`)
  }
}

const requests = {
  del: (url: string) =>
    superagent.del(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  get: (url: string) =>
    superagent.get(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  put: (url: string, body: any) =>
    superagent.put(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody),
  post: (url: string, body: any) =>
    superagent.post(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody),
  upload: (url: string, body: any, file: any) => 
    superagent.post(`${API_ROOT}${url}`, body).send(file).then(responseBody),
}

const Auth = {
  current: () =>
    requests.get('/user'),
  login: (email: string, password: string) =>
    requests.post('/users/login', { user: { email, password } }),
  register: (username: string, email: string, password: string) =>
    requests.post('/users', { user: { username, email, password } }),
  save: (user: any) =>
    requests.put('/user', { user })
}

const Tags = {
  getAll: () => requests.get('/tags')
}

const limit = (count: number, p: number) => `limit=${count}&offset=${p ? p * count : 0}`;
const omitSlug = (article: any) => Object.assign({}, article, { slug: undefined })
const Articles = {
  all: (page: number) =>
    requests.get(`/articles?${limit(10, page)}`),
  byAuthor: (author: string, page: number) =>
    requests.get(`/articles?author=${encode(author)}&${limit(5, page)}`),
  byTag: (tag: string, page: number) =>
    requests.get(`/articles?tag=${encode(tag)}&${limit(10, page)}`),
  del: (slug: string) =>
    requests.del(`/articles/${slug}`),
  favorite: (slug: string) =>
    requests.post(`/articles/${slug}/favorite`, null),
  favoritedBy: (author: string, page: number) =>
    requests.get(`/articles?favorited=${encode(author)}&${limit(5, page)}`),
  feed: () =>
    requests.get('/articles/feed?limit=10&offset=0'),
  get: (slug: string) =>
    requests.get(`/articles/${slug}`),
  unfavorite: (slug: string) =>
    requests.del(`/articles/${slug}/favorite`),
  update: (article: any) =>
    requests.put(`/articles/${article.slug}`, { article: omitSlug(article) }),
  create: (article: any) =>
    requests.post('/articles', { article })
}

const Profile = {
  follow: (username: string) =>
    requests.post(`/profiles/${username}/follow`, null),
  get: (username: string) =>
    requests.get(`/profiles/${username}`),
  unfollow: (username: string) =>
    requests.del(`/profiles/${username}/follow`)
}

const Wallet = {
  addWalletUser: (data: any) => requests.post(`/wallet/add`, data),
  fetchWalletUser: (address: string) => requests.get(`/wallet/${address}`),
  updateWalletUserName: (data: any) => requests.post('/wallet/update_name', data),
  updateWalletUserImage: (data: any) => requests.post('/wallet/update_image', data),
}

const Drop = {
  addDrop: (data: any) => requests.post('/drop/add', data),
  fetchDrop: (dropId: string) => requests.get(`/drop/${dropId}`),
  getFeaturedDrop: () => requests.get('/drop/featured'),
  getUpcomingDrops: () => requests.get('/drop/all'),
  updateBids: (data: any) => requests.post('/drop/update_bids', data)
}

const Upload = {
  uploadSingleImg: (data: any) => requests.post('/upload_image', data),
}

export default {
    Auth,
    Profile,
    Articles,
    Wallet,
    Drop,
    Upload,
    setToken: (_token: string) => { token = _token }
}