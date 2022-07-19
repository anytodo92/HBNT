import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useSelector } from 'react-redux';

import agent from "../agent"

function Drop() {

    const selectorWallet = useSelector((state:any) => {return state.walletConfig.user});
    
    const [amount, setAmount] = useState<string>('')
    const [bidList, setBidList] = useState<Array<any>>([])
    const [leftTime, setLeftTime] = useState<string>('')

    let { dropId } = useParams()
    const [dropInfo, setDropInfo] = useState<any>()

    const [invalidAmount, setInvalidAmount] = useState<boolean>(false)

    var intervalId: any
    useEffect(() => {
        (async () => {
            let data: any = await agent.Drop.fetchDrop(dropId as string)
            if (!data.drop)
                return
            setDropInfo(data.drop)

            let l = shortedBidList(data.drop.bids)
            setBidList(l)

            let dropDate = new Date(data.dropTime)
            let curDate = new Date()
            
            if (dropDate <= curDate) {
                setLeftTime('00:00:00:00')
            }
            else {                
                intervalId = setInterval(calcLeftTime.bind(null, data.drop), 1000)
            }
        })()
    }, []) 

    // For componentWillUnmount
    useEffect(() => {
        return () => {
            clearInterval(intervalId);
        }
    }, []);

    function shortedBidList(bidList: []) {
        for (let i = 0; i < bidList.length; i++) {
            let p: any = bidList[i]
            for (let j = i + 1; j < bidList.length; j++) {
                let n: any = bidList[j]
                if (n.amount > p.amount)
                {
                    bidList[i] = n as never
                    bidList[j] = p as never
                    p = n
                }
            }
        }

        return bidList
    }

    async function bid() {
        if (selectorWallet.userAddress == "") {
            return;
        }

        if (amount == '' || isNaN(amount as any)) {
            setInvalidAmount(true)
            return
        }
        else {
            setInvalidAmount(false)
        }

        bidList.push({
            amount: parseFloat(amount),
            wallet: selectorWallet.userAddress
        })

        const res = await agent.Drop.updateBids({bids: bidList, dropId: dropInfo.id})
        if (res) {
            console.log(res)            
            setDropInfo(res.drop)

            let l = shortedBidList(res.drop.bids)
            setBidList(l)
        }
    }

    function calcLeftTime(data: any) {
        let dropDate = new Date(data.dropTime)
        let curDate = new Date()
        if (dropDate <= curDate) {
            setLeftTime('00:00:00:00')
            clearInterval(intervalId)
        }

        const diff = dropDate.getTime() - curDate.getTime()

        //for test
        console.log("diff---:" + diff);

        if (diff <=0) {
            setLeftTime('Bid is closed')

            clearInterval(intervalId)
        } else {
            const days = Math.floor(diff / (3600 * 24 * 1000))
            let r = diff % (3600 * 24 * 1000)
            const hours = Math.floor(r / (3600 * 1000))
            r = r % (3600 * 1000)
            const minutes = Math.floor(r / (60 * 1000))
            r = r % (60 * 1000)
            const seconds = Math.floor(r / 1000)
            
            setLeftTime(new String(days).padStart(2, '0') + ':' +
            new String(hours).padStart(2, '0') + ':' +
            new String(minutes).padStart(2, '0') + ':' +
            new String(seconds).padStart(2, '0'))
        }        
    }

    let result = ''
    if (selectorWallet.userAddress != "") 
        if (selectorWallet.userBalance <= 0)
            result = 'You must have a token in your Wallet to Access the exclusive content. \n Get Token Here: Link'
        else 
            result = 'Welcome, You are now able to view the exclusive content.'
    else 
        result = 'You must sync your Wallet to Access the exclusive content.'

    return (
        <>
        <div className="mt-3">
            <div className="w-full mt-3 bg-yellow-100 text-yellow-800 text-sm font-semibold mr-2 px-2.5 py-1.5 rounded dark:bg-yellow-200 dark:text-yellow-900">
            { result }  
            </div>
        </div>        
        {dropInfo&& (            
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block py-2 min-w-full">
                        <div className="overflow-hidden shadow-md sm:rounded-lg">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                            Contract Address
                                        </th>
                                        <th scope="col" className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                            Token Id
                                        </th>
                                        <th scope="col" className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                            Items
                                        </th>
                                        <th scope="col" className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                            Wallets
                                        </th>
                                        <th scope="col" className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                            Image
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                                            {dropInfo.contract_address}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                                            {dropInfo.token_id}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500dark:text-gray-400">
                                            {
                                                dropInfo.items.map((v: string, idx: number) => (
                                                    <div key={idx} className="bg-green-100 text-green-800 text-xs font-semibold mt-2 mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">
                                                        {v}
                                                    </div>
                                                ))
                                            }
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500dark:text-gray-400">
                                            {
                                                dropInfo.wallets.map((v: string, idx: number) => (
                                                    <div key={idx} className="bg-green-100 text-green-800 text-xs font-semibold mt-2 mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">
                                                        {v}
                                                    </div>
                                                ))
                                            }
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                                            <img width={150} src={dropInfo.image} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        ) }
        <div className="py-6 text-lg font-semibold text-center">Time Left: {leftTime}</div>
        <div className={"flex flex-col w-full"}>
            <div className="w-full">                
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Bids: </label>                
            </div>
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <div className="inline-block min-w-full align-middle dark:bg-gray-800">
                    <div className="flex p-4">
                        <div className="relative flex mt-1 items-baseline">
                            <label>Place Bid</label>
                            <div className={(invalidAmount) ? 'required' : ''}>
                                <input type="text" name="amout" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-gray-50 ml-3 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Please input amount for bid" />
                                <div className="error text-sm text-red-500 mt-2 ml-5 hidden">Invalid amount.</div>
                            </div>                            
                            <label className="ml-1">tezos</label>
                        </div>
                        <button type="button" onClick={bid} className="py-2.5 px-5 ml-5 mt-1 mb-1 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Bid</button>
                    </div>
                    
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="py-3 pl-10 pr-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                            No
                            </th>
                            <th scope="col" className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                            Amount
                            </th>
                            <th scope="col" className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                            Address
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {bidList.length > 0 ? bidList.map((data: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700">                                        
                                    <td className="py-4 pl-10 pr-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-white">{idx + 1}</td>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-500 dark:text-white">{data.amount}</td>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-500 dark:text-white">{data.wallet}</td>                                    
                                </tr>
                            )) : (
                                <tr><td colSpan={4}><div className="p-4 text-gray-400 text-md">No bid data.</div></td></tr>                                    
                            )}  
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="w-full error text-sm text-red-500 mt-2 hidden">No item url.</div>
        </div> 
        </>
    )
}

export default Drop
