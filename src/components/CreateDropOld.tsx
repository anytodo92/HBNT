import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from "react-redux";
import agent from '../agent'

import { fetchData, mintNFT, uploadToIpfs } from "../actions";
import config from "../config";


function CreateDropOld(): JSX.Element {
    const dispatch = useDispatch();
    let navigate = useNavigate()

    const selectorTokenData = useSelector((state:any) => {return state.tokenData.payload});

    const [itemUrl, setItemUrl] = useState<string>('')
    const [walletAddress, setWalletAddress] = useState<string>('')
    const [contractAddress, setContractAddress] = useState<string>('')
    const [tokenId, setTokenId] = useState<number>(0)
        
    const [itemUrlList, setItemUrlList] = useState<Array<string>>(new Array())
    const [walletAddressList, setWalletAddressList] = useState<Array<string>>(new Array())

    const [imageData, setImageData] = useState<any>()
    const [selectedFile, setSelectedFile] = useState<any>()

    //const [datetime, onDatetimeChanged] = useState(new Date());
    const curYear = new Date().getFullYear()
    
    const [dropYear, setDropYear] = useState<string>(curYear + '')
    const [dropMonth, setDropMonth] = useState<string>('01')
    const [dropDay, setDropDay] = useState<string>('01')
    const [dropHour, setDropHour] = useState<string>('00')
    const [dropMinute, setDropMinute] = useState<string>('00')

    const years = Array.from(new Array(10), (val, index) => index + curYear)
    const months = Array.from(new Array(12), (val, index) => new String(index + 1).padStart(2, '0'))
    const days = Array.from(new Array(31), (val, index) => new String(index + 1).padStart(2, '0'))
    const hours = Array.from(new Array(24), (val, index) => new String(index).padStart(2, '0'))
    const minutes = Array.from(new Array(60), (val, index) => new String(index).padStart(2, '0'))

    const requiredClassName = 'required'
    // const [invalidContractAddress, setInvalidContractAddress] = useState<boolean>(false)
    // const [invalidTokenId, setInvalidTokenId] = useState<boolean>(false)
    const [invalidDropYear, setInvalidDropYear] = useState<boolean>(false)
    const [invalidDropMonth, setInvalidDropMonth] = useState<boolean>(false)
    const [invalidDropDay, setInvalidDropDay] = useState<boolean>(false)
    const [invalidDropHour, setInvalidDropHour] = useState<boolean>(false)
    const [invalidDropMinute, setInvalidDropMinute] = useState<boolean>(false)
    const [emptyItemUrl, setEmptyItemUrl] = useState<boolean>(false)
    const [emptyWalletAddress, setEmptyWalletAddress] = useState<boolean>(false)
    const [isMinting, setMinting] = useState(false);
    const [isMinted, setMinted] = useState(false);
    const [specText, setSpecText] = useState<string>('');
    const [mintedTokenId, setMintedTokenId] = useState(0);

    const addItemUrl = () => {
        if (itemUrl.length == 0)
            return

        itemUrlList.push(itemUrl)

        setItemUrl('')
    }

    const addWallet = () => {
        if (walletAddress.length == 0)
            return
        
        walletAddressList.push(walletAddress)

        setWalletAddress('')
    }

    const onChange = (event: any) => {
        if (typeof event.target.value === 'undefined')
            return

        const value: string = event.target.value
        switch (event.target.name) {
            case 'item_url':
                setItemUrl(value)
                break
            // case 'contract_address':
            //     setContractAddress(value)
            //     break
            // case 'token_id':
            //     setTokenId(value)
            //     break
            case 'wallet_address':
                setWalletAddress(value)
                break
            case 'drop_year':
                setDropYear(value)
                break
            case 'drop_month':
                setDropMonth(value)
                break
            case 'drop_day':
                setDropDay(value)
                break
            case 'drop_hour':
                setDropHour(value)
                break
            case 'drop_minute':
                setDropMinute(value)
                break
        }
    }

    const deleteItemUrl = (idx: number) => {
        let v = itemUrlList.filter((v, k) => (k != idx))
        setItemUrlList(v)
    }

    const deleteWalletAddress = (idx: number) => {
        let v = walletAddressList.filter((v, k) => k != idx)
        setWalletAddressList(v)
    }

    const createDrop = async () => {
        
        setSpecText('');

        if (!isMinted) {
            setSpecText('Please mint first.');
            return
        }
        
        if (itemUrlList.length == 0) {
            setEmptyItemUrl(true)
            setSpecText('Please add item urls.');
            return
        }
        else {
            setEmptyItemUrl(false)
        }

        if (walletAddressList.length == 0) {
            setEmptyWalletAddress(true)
            setSpecText('Please add wallet address.');
            return
        }
        else {
            setEmptyWalletAddress(false)
        }        

        let dropTime = `${dropYear}-${dropMonth}-${dropDay}T${dropHour}:${dropMinute}:00`
        let dropDate = new Date(dropTime)
        let curDate = new Date()

        if (dropDate < curDate) {
            setInvalidDropYear(true)
            setInvalidDropMonth(true)
            setInvalidDropDay(true)
            setInvalidDropHour(true)
            setInvalidDropMinute(true)

            setSpecText('select correctly date time!');
            return
        }
        else {
            setInvalidDropYear(false)
            setInvalidDropMonth(false)
            setInvalidDropDay(false)
            setInvalidDropHour(false)
            setInvalidDropMinute(false)
        }
             
        try {            
            const data = {
                contract_address: config.tokenAddress,
                token_id: mintedTokenId,                                
                items: itemUrlList,
                image: imageData,
                wallets: walletAddressList,
                dropTime: dropTime
            }

            const res: any = await agent.Drop.addDrop(data)                

            if (res.drop) {
                navigate(`/drop/${res.drop.id}`);
            }    
        } catch (err) {
            console.log(err);
            console.log('Error: Not Able to creat drop');
        }        
    } 

    const mintDrop = async () => {
        
        setSpecText('');
        if (!imageData) {
            setSpecText('Please choose the file to upload.');
            return
        }
             
        setMinting(true);
        try {
            console.log("selectedFile.name---:" + selectedFile.name);

            //Upload To Ipfs
            setSpecText('Uploading files to IPFS...');
            const ipfsUrl = await uploadToIpfs({name: selectedFile.name, description: selectedFile.name, imgFile: selectedFile, creator:""}); 
            
            console.log("ipfsUrl---:" + ipfsUrl);

            setSpecText('Your wallet will ask for a confirmation, please accept it...');
            const amount: number = 8;            
            const mint_op = await mintNFT({amount, metadata: ipfsUrl});   
            setSpecText('Mining to the Tezos blockchain... Please wait...');

            const confirm_op = await mint_op.confirmation();	
            console.log(confirm_op);

            if (confirm_op.completed) { //save to server
                setSpecText('Complete! It may take up to 5 minutes to show up. You can create drop.');
                setMintedTokenId(selectorTokenData==undefined?0:selectorTokenData.length);

                setMinted(true);
                dispatch(fetchData()); 
            } else {
                setMinted(false);
            }                     
        } catch (err) {
            setMinted(false);
            console.log('Error:' + err);
            setSpecText('Error:' + (err as Error).message);            
        }       
        setMinting(false);   
    } 

    const fileChanged = (e: any) => {
        let files = e.target.files

        let reader = new FileReader()
        reader.onload = (r: any) => {
            setImageData(r.target.result)
        }        
        reader.readAsDataURL(files[0])        
        
        setSelectedFile(files[0])
        setMinted(false);  
    }

    return (
        <form>                        
            <div className="flex">
                <div className={"flex flex-col w-full" + (emptyItemUrl ? requiredClassName : '')}>
                    <div className="w-full">                
                        <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Item URL(s)</label>                
                    </div>
                    <div className="overflow-x-auto shadow-md sm:rounded-lg">
                        <div className="inline-block min-w-full align-middle dark:bg-gray-800">
                            <div className="flex p-4">
                                <div className="relative mt-1">
                                    <input type="text" name="item_url" value={itemUrl} onChange={onChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Please input item url" />
                                </div>
                                <button type="button" onClick={addItemUrl} className="py-2.5 px-5 ml-2 mt-1 mb-1 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Add Item</button>
                            </div>
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="py-3 pl-10 pr-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                    No
                                    </th>
                                    <th scope="col" className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                    URL
                                    </th>
                                    <th scope="col" className="p-4">&nbsp;</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {itemUrlList.length > 0 ? itemUrlList.map((url: string, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700">                                        
                                            <td className="py-4 pl-10 pr-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-white">{idx + 1}</td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-500 dark:text-white">{url}</td>
                                            <td className="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                                            <button type="button" onClick={() => deleteItemUrl(idx)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" id="trash" className="w-5 h-5 text-cool-gray-800 dark:text-cool-gray-200 group-hover:text-purple-600 group-focus:text-purple-600 dark:group-hover:text-purple-50 dark:group-focus:text-purple-50">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                                    </path> 
                                                </svg>
                                            </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4}><div className="p-4 text-gray-400 text-md">Please add new item.</div></td></tr>                                    
                                    )}  
                                </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="w-full error text-sm text-red-500 mt-2 hidden">No item url.</div>
                </div> 
                <div className={"flex flex-col ml-3 w-full" + (emptyWalletAddress ? requiredClassName : '')}>
                    <div className="w-full">                
                        <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Wallet Address(s)</label>                
                    </div>
                    <div className="overflow-x-auto shadow-md sm:rounded-lg">
                        <div className="inline-block min-w-full align-middle dark:bg-gray-800">
                            <div className="flex p-4">
                                <div className="relative mt-1">
                                    <input type="text" name="wallet_address" value={walletAddress} onChange={onChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Please input wallet address" />
                                </div>
                                <button type="button" onClick={addWallet} className="py-2.5 px-5 ml-2 mt-1 mb-1 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Add Wallet</button>
                            </div>
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="py-3 pl-10 pr-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                    No
                                    </th>
                                    <th scope="col" className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                    Address
                                    </th>
                                    <th scope="col" className="p-4">&nbsp;</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {walletAddressList.length > 0 ? walletAddressList.map((address: string, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700">                                        
                                            <td className="py-4 pl-10 pr-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-white">{idx + 1}</td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-500 dark:text-white">{address}</td>
                                            <td className="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                                            <button type="button" onClick={() => deleteWalletAddress(idx)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" id="trash" className="w-5 h-5 text-cool-gray-800 dark:text-cool-gray-200 group-hover:text-purple-600 group-focus:text-purple-600 dark:group-hover:text-purple-50 dark:group-focus:text-purple-50">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                                    </path> 
                                                </svg>
                                            </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4}><div className="p-4 text-gray-400 text-md">Please add new wallet.</div></td></tr>                                    
                                    )}  
                                </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="w-full error text-sm text-red-500 mt-2 hidden">No wallet address.</div>
                </div> 
            </div>
                       
            <div className="mx-3 mt-8">
                <div className="float-right drop-img">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" id="trash" className="w-5 h-5 text-cool-gray-800 dark:text-cool-gray-200 group-hover:text-purple-600 group-focus:text-purple-600 dark:group-hover:text-purple-50 dark:group-focus:text-purple-50">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                        </path> 
                    </svg>
                    <img src={imageData} />                    
                    <input type="file" onChange={fileChanged} />
                </div>
                <div className="drop-input">
                    <div className={"relative z-0 mb-6 group "/* + (invalidContractAddress? requiredClassName : '')*/}>
                        <input type="text" disabled={true} name="contract_address" value={config.tokenAddress} onChange={onChange} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" "/>
                        <label htmlFor="contract_address" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Contract Address</label>
                        <div className="w-full error text-sm text-red-500 hidden">Invalid a contract address.</div>
                    </div>
                    <div  className={"relative z-0 mb-6 group "/* + (invalidTokenId? requiredClassName : '')*/}>
                        <input type="text" disabled={true} name="token_id" value={selectorTokenData==undefined?0:selectorTokenData.length} onChange={onChange} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label htmlFor="token_id" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Token ID</label>
                        <div className="w-full error text-sm text-red-500 hidden">Invalid a token id.</div>
                    </div>
                    <div className="flex text-gray-500 text-sm z-0 mb-6">Drop Time: </div>
                    <div className={"flex z-0 mb-6"}>
                        <div className={"relative z-0 group w-32 " + (invalidDropYear? requiredClassName : '')}>
                            <select name="drop_year" value={dropYear} onChange={onChange} 
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                            {years.map((v, k) => (
                                <option key={k} value={v}>{v}</option>
                            ))}                                
                            </select>
                            <label htmlFor="drop_year" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Year</label>
                        </div>
                        <label className="w-10 text-gray-400 mt-3 text-center">/</label>
                        <div className={"relative z-0 group w-32 " + (invalidDropMonth? requiredClassName : '')}>
                            <select name="drop_month" value={dropMonth} onChange={onChange} 
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                            {months.map((v, k) => (
                            <option key={k} value={v}>{v}</option>
                            ))}      
                            </select>
                            <label htmlFor="drop_month" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Month</label>
                        </div>
                        <label className="w-10 text-gray-400 mt-3 text-center">/</label>
                        <div className={"relative z-0 group w-32 " + (invalidDropDay? requiredClassName : '')}>
                            <select name="drop_day" value={dropDay} onChange={onChange} 
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                            {days.map((v, k) => (
                                <option key={k} value={v}>{v}</option>
                            ))}      
                            </select>
                            <label htmlFor="drop_day" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Day</label>
                        </div>
                        <div className={"relative z-0 group w-20 ml-10 " + (invalidDropHour? requiredClassName : '')}>
                            <select name="drop_hour" value={dropHour} onChange={onChange} 
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                            {hours.map((v, k) => (
                                <option key={k} value={v}>{v}</option>
                            ))}      
                            </select>
                            <label htmlFor="drop_hour" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Hour</label>
                        </div>
                        <label className="w-10 text-gray-400 mt-3 text-center">:</label>
                        <div className={"relative z-0 group w-20 " + (invalidDropMinute? requiredClassName : '')}>
                            <select name="drop_minute" value={dropMinute} onChange={onChange} 
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                            {minutes.map((v, k) => (
                                <option key={k} value={v}>{v}</option>
                            ))}      
                            </select>
                            <label htmlFor="drop_minute" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Minute</label>
                        </div>

                        {/*<><div className="datepicker relative form-floating mb-3 xl:w-96">
                            <input type="text" className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none form-icon-trailing" placeholder="Select a date" />
                            <label htmlFor="floatingInput" className="text-gray-700">Select a date</label>
                            
                            <button id="datepicker-toggle-792478" type="button" className="datepicker-toggle-button" data-mdb-toggle="datepicker">
                            <i className="far fa-calendar datepicker-toggle-icon"></i>
                            </button>
                        </div>

                        <div className="timepicker relative form-floating mb-3 xl:w-96">
                            <input type="text"
                                className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                placeholder="Select a time" />
                            <label htmlFor="floatingInput" className="text-gray-700">Select a time</label>
                                    </div></>*/}
                        {/*<DateTimePicker onChange={onDatetimeChanged} value={datetime} />*/}
                    </div>  
                </div>                 
                <div className={(specText==''?'hidden':'' + 'mt-3  mb-3')}>
                    <div className={(isMinting?'w-full mt-3 bg-white-100 text-yellow-800 text-sm font-semibold mr-2 px-2.5 py-1.5 rounded dark:bg-white-200 dark:text-yellow-900'
                    :'w-full mt-3 bg-yellow-100 text-yellow-800 text-sm font-semibold mr-2 px-2.5 py-1.5 rounded dark:bg-yellow-200 dark:text-yellow-900')}>
                        {specText}
                    </div>
                </div>  
                <div className="flex spece-x-5">
                    <button type="button" onClick={mintDrop} className="flex items-center justify-center text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                        <div className={(isMinting?'':'hidden')}>
                            <svg  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div> 
                        {isMinting? 'is Minting ...' : 'Mint'}
                    </button>
                    <button type="button" onClick={createDrop} className={"text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ml-7" + (isMinting?'':'')} disabled={isMinting}>{('Create Drop')}</button>                            
                </div>    
            </div>            
        </form>
    )
}

export default CreateDropOld