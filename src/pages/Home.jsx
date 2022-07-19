import { useState, useEffect } from 'react'
import agent from '../agent'
import { useNavigate } from 'react-router'

function Home() {
    const navigate = useNavigate()

    const [featuredDrop, setFeaturedDrop] = useState()
    const [upcomingDrops, setUpcomingDrops] = useState()
    
    useEffect(() => {
        (async () => {
            console.log('fetch upcoming drops')
            const ret = await agent.Drop.getFeaturedDrop()
            if (ret.drop) {
                setFeaturedDrop(ret.drop)
            }
        })()
    }, [])

    useEffect(() => {
        (async () => {
            console.log('fetch featured drop')
            const ret = await agent.Drop.getUpcomingDrops()           
            if (ret.drops) {                
                setUpcomingDrops(ret.drops)        
            }
        })()
    }, [])

    return (
        <div className="">
            <nav className="flex mt-8" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                        <a href="#" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                        Home
                        </a>
                    </li> 
                </ol>
            </nav>

            <div className="w-full featured-drop">
                {(featuredDrop)&&
                    <>
                    <img src={featuredDrop.image} className="float-right w-28 mt-10" />
                    <div className="mr-32">
                        <h3 className="text-lg font-medium my-10 text-center">Featured Drop</h3>
                        <div className="txt-md">
                            This is next drop <br/>
                            Artist: xyz
                        </div>

                    </div>
                    </>
                }
                
            </div>
            <div className="w-full upcoming-drops">
                <h3 className="text-lg font-medium my-10">Upcoming Drops
                </h3>
                <div className="overflow-x-auto pb-2"> 
                    <div className="flex">
                        {(upcomingDrops && upcomingDrops.length > 0)&&
                        upcomingDrops.map((v, k) => {
                            if (k == 0)
                                return (<div key={k} onClick={() => navigate(`/drop/${v.id}`)} className="drop block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                                    <img src={v.image} />
                                </div>)
                            else
                            return (<div key={k} onClick={() => navigate(`/drop/${v.id}`)} className="drop ml-2 block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                                <img src={v.image} />
                            </div>)
                        })}
                    </div>               
                </div>
            </div>
        </div>
    )
}

export default Home