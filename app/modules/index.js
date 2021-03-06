// @flow
import { combineReducers } from 'redux'
import { reducer as spunky } from 'spunky'

import generateWallet from './generateWallet'
import claim from './claim'
import notifications from './notifications'
import modal from './modal'

export default combineReducers({
  spunky,
  generateWallet,
  claim,
  notifications,
  modal
})
