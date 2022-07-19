import { combineReducers } from "redux"
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

const persistConfig = {
	key: "root",
	storage,
};


const initialWalletState = {
    user: {
        userAddress : "",
        userBalance : 0,
        userName : "",
        userImage :  "",        
    },
}

const connectWalletReducer = (config = initialWalletState, action : any) => {
    switch(action.type){
        case "CONNECT_WALLET":
            console.log("CONNECT_WALLET");
            return {...config, user: action.user, 
                        };
        case "LOGIN_WALLET_USER":
            console.log("LOGIN_WALLET_USER");
            return {...config, user: action.user, 
                        };
        case "UPDATE_WALLET_USER":
            console.log("UPDATE_WALLET_USER");
            return {...config, user: action.user, 
                        };
        case "DISCONNECT_WALLET":
            storage.removeItem('persist:root')
            return {...initialWalletState,
                    };
        case "TEZOS_INSTANCE":
            return {...config}
        case "CONNECT_WALLET_ERROR":
            return config;
        default:
            return config;
    }
}

const tokenDataReducer = (state=[], action : any)=>{
    switch(action.type){
        case "SET_TOKEN_DATA":
            return {...state, payload: action.payload};
        default:
            return state;
    }
}


const reducers = combineReducers({walletConfig: connectWalletReducer, tokenData: tokenDataReducer});
const persistedReducer = persistReducer(persistConfig, reducers);
export default persistedReducer;