import { useSelector, useDispatch } from "react-redux"
import { useState, useRef, useEffect } from 'react'

import TabBar from "../components/TabBar"
import CreateDrop from "../components/ProfileCreateDrop"
import History from "../components/ProfileHistory"
import Owned from "../components/ProfileOwned"
import Created from "../components/ProfileCreated"

import agent from "../agent"

function Profile() {
    const dispatch = useDispatch();

    const [tabId, setTabId] = useState<number>(0);

    const selectorWallet = useSelector((state:any) => {return state.walletConfig.user});
    const userNameInput = useRef<HTMLInputElement>(null);

    const [openedCreateDrop, setOpenedCreateDrop] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>("");
    const [userImage, setUserImage] = useState<string>("");
    const [isEditUserName, setIsEditUserName] = useState<boolean>(false);
     
    useEffect(() => {
        (async () => {
            try {
                console.log('fetchWalletUser');
                const ret = await agent.Wallet.fetchWalletUser(selectorWallet.userAddress as string);
                if (ret == null) return;
                if (ret.wallet != null) {
                    
                    setUserName(ret.wallet.name);
                    setUserImage(ret.wallet.image);
                } 
            } catch (error) {
                console.log(error);
            }
        })()
      }, [selectorWallet.userAddress])

    const saveUserName = async() => {
        if (isEditUserName) {
            //updateUserName  
            try {          
                const res = await agent.Wallet.updateWalletUserName({address: selectorWallet.userAddress, name: userName})                
                // update static user in reducer
                const payload : any= {};
				payload.user= {
					userAddress: selectorWallet.userAddress,
					userBalance: selectorWallet.userBalance,
					userName: userName,
					userImage:  userImage,
				};
				dispatch({
					type: "UPDATE_WALLET_USER",
					user: payload.user,
				});           
            } catch (err) {
                console.log(err);
            }
        } else {
            setTimeout(() => {
                userNameInput.current?.focus();
            }, 300);
        }
        setIsEditUserName(!isEditUserName);
    }

    const saveUserImage = async(imageFile: any) => {
        //updateUserImage  
        try {     
            const formData = new FormData();
            formData.append('uploadImg', imageFile);
            const res = await agent.Upload.uploadSingleImg(formData)            
            let imgUrl = res.upload;
            setUserImage(imgUrl);

            await agent.Wallet.updateWalletUserImage({address: selectorWallet.userAddress, image: imgUrl})    

            // update static user in reducer
            const payload : any= {};
            payload.user= {
                userAddress: selectorWallet.userAddress,
                userBalance: selectorWallet.userBalance,
                userName: userName,
                userImage:  imgUrl, 
            };
            dispatch({
                type: "UPDATE_WALLET_USER",
                user: payload.user,
            });           
        } catch (err) {
            console.log(err);
        }
    }

    const connectTwitter = async(username: string) => {
        window.open(`http://twitter.com/#!/` + username);
    }

    const onChange = (event: any) => {
        if (typeof event.target.value === 'undefined')
            return

        const value: string = event.target.value
        switch (event.target.name) {
            case 'user_name':
                setUserName(value);
                break
        }
    }

    const fileChanged = (e: any) => {
        try {
            let files = e.target.files   
            if (files.length == 0) return;
            let reader = new FileReader()  
            reader.onload = (r: any) => {  
                saveUserImage(files[0])
            }  
            reader.readAsDataURL(files[0]) 
        } catch (error) {
            console.log("error", error);
        }         
    }

    const onTabChange = (tabId: number) => {
        setTabId(tabId)
    }

    return (
        <div className="">
            <nav className="flex mt-8" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                        <a href="#" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                        Profile
                        </a>
                    </li> 
                </ol>
            </nav>
            
            <div className="flex justify-between">
                <div>
                    <div className="flex pl-5 pb-5">                        
                        <input ref={userNameInput} type="text" name="user_name" value={userName} onChange={onChange} className="w-96 block py-2.5 px-0 w-full text-xl font-bold text-gray-900 bg-transparent border-b border-gray-600 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                        <button onClick={saveUserName} className="h-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-3 mt-2.5" >{isEditUserName?'Save':'Edit'}</button>
                    </div>
                    <div><button onClick={() => connectTwitter(userName)} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-3">Connect Twitter</button></div>
                    {(!openedCreateDrop)&& (
                    <div><button onClick={() => setOpenedCreateDrop(true)} className="w-64 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-3 mt-5">Create Drop</button></div>
                    )}
                </div>
                <div className="pt-4 pr-12">
                    <div className="float-right drop-img">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" id="trash" className="w-5 h-5 text-cool-gray-800 dark:text-cool-gray-200 group-hover:text-purple-600 group-focus:text-purple-600 dark:group-hover:text-purple-50 dark:group-focus:text-purple-50">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                            </path> 
                        </svg>
                        <img src={userImage} />                                      
                        <input type="file" onChange={fileChanged} />
                    </div>
                </div>
            </div>
            
            {(openedCreateDrop)&& (
                <>
                    <TabBar onTab={onTabChange}/>            
                    <div className="mx-3">
                        {(tabId===0)&& (
                            <CreateDrop />     
                        )}   
                        {(tabId===1)&& (
                            <History />     
                        )} 
                        {(tabId===2)&& (
                            <Owned />     
                        )} 
                        {(tabId===3)&& (
                            <Created />     
                        )}         
                    </div> 
                </>
            )}
        </div>
    )
}

export default Profile
