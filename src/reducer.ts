import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import auth from './reducers/auth'
import common from './reducers/common'
import home from './reducers/home'
import wallet from './reducers/wallet'
/*import contract from './reducers/contract'
import about from './reducers/about'*/

export default combineReducers({
  auth,
  common,
  home,
  wallet,
  router: routerReducer
})