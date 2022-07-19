
import { useState } from 'react'

type TabBarProps = {
    onTab: any
}
function TabBar({ onTab }: TabBarProps): JSX.Element {

    const [tabId, setTabId] = useState<number>(0);

    const tabClick = (index: number) => {   
        setTabId(index)     
        onTab(index)
    }

    return (
        <div className="mb-4 mt-5 border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px">
                <li onClick={() => tabClick(0)} className="">
                    <button className={"py-1.5 px-4 text-sm font-medium text-center text-black rounded-t-lg border-l-2 border-t-2 border-r-2 border-white hover:text-gray-600 hover:border-gray-200 dark:text-gray-400 dark:hover:text-gray-300 bg-gray-200 " + (tabId==0?"active":"")} type="button">Create Drop</button>
                </li>
                <li onClick={() => tabClick(1)} className="">
                    <button className={"py-1.5 px-4 text-sm font-medium text-center text-black rounded-t-lg border-l-2 border-t-2 border-r-2 border-white hover:text-gray-600 hover:border-gray-200 dark:text-gray-400 dark:hover:text-gray-300 bg-gray-200 " + (tabId==1?"active":"")} type="button">History</button>
                </li>
                <li onClick={() => tabClick(2)} className="">
                    <button className={"py-1.5 px-4 text-sm font-medium text-center text-black rounded-t-lg border-l-2 border-t-2 border-r-2 border-white hover:text-gray-600 hover:border-gray-200 dark:text-gray-400 dark:hover:text-gray-300 bg-gray-200 " + (tabId==2?"active":"")} type="button">Owned</button>
                </li>
                <li onClick={() => tabClick(3)} className="">
                    <button className={"py-1.5 px-4 text-sm font-medium text-center text-black rounded-t-lg border-l-2 border-t-2 border-r-2 border-white hover:text-gray-600 hover:border-gray-200 dark:text-gray-400 dark:hover:text-gray-300 bg-gray-200 " + (tabId==3?"active":"")} type="button">Created</button>
                </li>
            </ul>
        </div>        
    )
}

export default TabBar