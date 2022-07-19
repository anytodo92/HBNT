import { SYNC_WALLET, UNSYNC_WALLET } from '../constants/ActionTypes'

export default (state = {}, action: any) => {
  switch (action.type) {
    case SYNC_WALLET:
        return {
            ...action
        }
    case UNSYNC_WALLET:
        return {
            ...action            
        }
    default:
        return state
  }
}