import { MouseEvent, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router"
import agent from '../agent'

import { connectWallet, disconnectWallet } from '../actions';

function Header() {     
    const dispatch = useDispatch();
    let navigate = useNavigate()

    const selectorWallet = useSelector((state:any) => {return state.walletConfig.user});
    // const isFirstRender = useRef(true);

    // useEffect(() => {
    //     if (isFirstRender.current) {
    //       isFirstRender.current = false
    
    //       return
    //     }    

    //     console.log("selectorWallet.userAddress---:" + selectorWallet.userAddress);
    //     if (selectorWallet.userAddress !== "") {
    //         (async () => {
    //             try {
    //                 const ret = await agent.Wallet.fetchWalletUser(selectorWallet.userAddress as string);
    //                 //If there is no this walllet in server, add this wallet
    //                 if (ret.wallet == null) {
    //                     const data = {
    //                         address: selectorWallet.userAddress,
    //                         name: "",                                
    //                         image: ""
    //                     }
            
    //                     const res: any = await agent.Wallet.addWalletUser(data) 
    //                 } else {
    //                     console.log("ret.wallet.name---:" + ret.wallet.name);
    //                     console.log("ret.wallet.image---:" + ret.wallet.image);
    //                     const payload : any= {};
    //                     payload.user= {
    //                         userAddress: selectorWallet.userAddress,
    //                         userBalance: selectorWallet.userBalance,
    //                         userName: ret.wallet.name,
    //                         userImage:  ret.wallet.image, 
    //                     };
    //                     dispatch({
    //                         type: "LOGIN_WALLET_USER",
    //                         user: payload.user,
    //                     });
    //                 }
    //             } catch (error) {
    //                 console.log(error);
    //             }
    //         })()
    //     }
    //   }, [ selectorWallet.userAddress ])

    const onClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(selectorWallet.userAddress===""){
            dispatch(connectWallet());
        }else{
            dispatch(disconnectWallet());
        }
    }  

    return (
        <nav className="flex sticky top-0 z-40 flex-none py-3 mx-auto w-full bg-white border-b border-gray-200 dark:border-gray-600 dark:bg-gray-800">
            <div className="container flex flex-wrap justify-between items-center mx-auto">
                <div className="flex">
                    <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Henbane</span>
                </div>
                <div className="flex items-center md:order-2">  
                    <div className="bg-indigo-100 text-indigo-800 text-sm font-medium mr-2 px-2.5 py-2.5 rounded dark:bg-indigo-200 dark:text-indigo-900">{selectorWallet.userName===""?selectorWallet.userAddress:selectorWallet.userName}</div>
                    <div> {                       
                        (selectorWallet.userAddress!=="") &&
                            <button type="button"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-3" 
                                id="btn_account" onClick={() => navigate(`/profile`)}
                                aria-expanded="false">My Account</button>                        
                    }
                    </div>                    
                    <div className="">
                        {(selectorWallet.userAddress==="")?
                            <button type="button" onClick ={onClick} 
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-3" 
                                id="btn_sync_wallet" 
                                aria-expanded="false">Sync</button>:
                            <button type="button" onClick={onClick} 
                                className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900" 
                                id="btn_sync_wallet" 
                                aria-expanded="false">Unsync</button>}
                    </div>
                </div>
                <div className="hidden justify-between items-center w-full md:flex md:w-auto md:order-1">
                    <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
                    <li>
                        <Link to="/" className="text-lg font-medium text-gray-900 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Home</Link>
                    </li>
                    <li>
                        <Link to="/about" className="text-lg font-medium text-gray-900 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">About</Link>
                    </li>
                    <li>
                        <Link to="/contact" className="text-lg font-medium text-gray-900 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Contact</Link>
                    </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}
  
export default Header;
