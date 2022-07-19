import { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router'
import dayjs from 'dayjs';
import { DatePicker } from '@mantine/dates';

import config from "../config";
import agent from "../agent"
import { fetchData, mintNFT, uploadToIpfs } from "../actions";
import '../styles/custom.css';

function ProfileCreateDrop() {
  //NAVIGATE
  let navigate = useNavigate()
  //USER, TOKEN INFO FROM REDUCER
  const selectorWallet = useSelector((state:any) => {return state.walletConfig.user});
  const selectorTokenData = useSelector((state:any) => {return state.tokenData.payload});
  //RESELL
  const [r_itemUrl, r_setItemUrl] = useState<string>('');
  const [r_title, r_setTitle] = useState<string>('');
  const [r_description, r_setDesc] = useState<string>('');
  const [r_image, r_setImage] = useState<string>('');
  const [r_isloading, r_setLoading] = useState<boolean>(false);
  //MINT
  const [m_title, m_setTitle] = useState<string>('');
  const [m_description, m_setDesc] = useState<string>('');
  const [m_image, m_setImage] = useState<string>('');
  const [m_imageFile, m_setImageFile] = useState<any>(null);
  const [m_metadata, m_setMetadata] = useState<string>('');  
  const [m_isMetaUploading, m_setMetaUploading] = useState<boolean>(false);
  const [m_isminting, m_setMinting] = useState<boolean>(false);
  //TRUE: MINT, FALSE: RESELL
  const [isMintSelect, setIsMintSelect] = useState<boolean>(true);
  //TRUE: PUBLIC, FALSE: WHITELIST
  const [isPublicSelect, setIsPublicSelect] = useState<boolean>(true);
  //DATE 
  const [intervalCounter, setIntervalCounter] = useState<number>(0);
  const [isStartInterval, setStartInterval] = useState<boolean>(false);
  const [dropDate, setDropDate] = useState<Date | null>(null);
  const [leftTime, setLeftTime] = useState<string>('');
  //WHITELIST
  const [emptyWalletAddress, setEmptyWalletAddress] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletAddressList, setWalletAddressList] = useState<Array<string>>(new Array());
  //CHECKING LOADING
  const [isDropping, setDropping] = useState<boolean>(false);
  const [specText, setSpecText] = useState<string>('');
  //CLASS-REQUIRE
  const requiredClassName = 'required';
  //INTERVAL
  var interValID: any;
  var interValCnt: number = 0;
  useEffect( () => {
      calcLeftTime();
  }, [intervalCounter]);

  // Unmount
  useEffect(() => {
    if (!isStartInterval) {
      interValID = setInterval(loopInterval.bind(null, null), 1000);
      setStartInterval(true);
    }
    return () => {
      clearInterval(interValID); 
    }
  }, []);

  const createDrop = async() => {
    setSpecText("");    
    let contract_address: String,
        token_id: String,
        title: String,
        description: String,
        metadata: String,    
        items: any,
        image: String,
        wallets: any,    
        dropTime: String;

    //CHECK VALUE
    if(isMintSelect) {  //MINT
      if (m_title === "" || m_title === null) {
        setSpecText("Please input title for minting");  
        return;
      }
      if (m_description === "" || m_description === null) {
        setSpecText("Please input description for minting");  
        return;
      }
      if (m_image === "" || m_image === null) {
        setSpecText("Please upload image for minting");  
        return;
      }
      if (m_metadata === "" || m_metadata === null) {
        setSpecText("Please upload metadata");  
        return;
      }
    } else {            //RESELL
      if ((r_title === "" || r_title === null) &&
          (r_description === "" || r_description === null) &&
          (r_image === "" || r_image === null)) {
          setSpecText("Please load data for reselling");  
          return;
      }
      if (r_title === "" || r_title === null) {
        setSpecText("Please input title for reselling");  
        return;
      }
      if (r_description === "" || r_description === null) {
        setSpecText("Please input description for reselling");  
        return;
      }
      if (r_image === "" || r_image === null) {
        setSpecText("Please upload image for reselling");  
        return;
      }
    }
    if (dropDate === null) {
      setSpecText("Please set drop date");  
      return;
    }
    if (!isPublicSelect) {  //WHITLIST
      if(walletAddressList === null || walletAddressList.length === 0) {
        setSpecText("Please insert whitelist");  
        return;
      }
    }

    //INPUT VALUE
    contract_address = config.tokenAddress;
    token_id = selectorTokenData==undefined?0:selectorTokenData.length;
    items = new Array();
    if (isPublicSelect)    
      wallets = new Array();
    else
      wallets = walletAddressList;
    //let dropTime = `${dropYear}-${dropMonth}-${dropDay}T${dropHour}:${dropMinute}:00`  
    dropTime = formatDate(dropDate);
    if(isMintSelect) {  //MINT
      title = m_title;
      description = m_description;
      metadata = "";
      image = m_image; 
    } else {            //RESELL
      title = r_title;
      description = r_description;
      metadata = "";
      image = r_image;      
    }
    //test
    console.log("dropTime", dropTime);
    try {            
      const data = {
          contract_address: contract_address,
          token_id: token_id,     
          title: title,
          description: description,   
          metadata: metadata,                        
          items: items,
          image: image,
          wallets: wallets,
          dropTime: dropTime
      }      
      setDropping(true);
      const res: any = await agent.Drop.addDrop(data);
      if (res.drop) {
        clearInterval(interValID);
        setTimeout(() => { navigateToDrop(res.drop.id) }, 2000);        
      } else {
        setDropping(false);
      }    
    } catch (err) {
        console.log(err);
        console.log('Error: Not Able to creat drop');
    }      
  }

  const navigateToDrop = (dropId: string) => {
    setDropping(false);
    navigate(`/drop/${dropId}`);
  }

  const loadData = () => {
    setSpecText(""); 
    if (r_itemUrl === null || r_itemUrl === "") {
      setSpecText("please input load url"); 
      return;
    }    
    r_setLoading(true);    
    var opengraph = require('opengraph-io')({
      appId: config.opengraphApiKey, 
      cacheOk: true, // If a cached result is available, use it for quickness
      useProxy: true,  // Proxies help avoid being blocked and can bypass capchas
      maxCacheAge: 432000000, // The maximum cache age to accept
      acceptLang: 'en-US,en;q=0.9', // Language to present to the site. 
      fullRender: true // This will cause JS to execute when rendering to deal with JS dependant sites
    });
    opengraph.getSiteInfo(r_itemUrl, function(err: any, result: any){             
      try { 
        r_setLoading(false);
        r_setTitle(result.hybridGraph.title);
        r_setDesc(result.hybridGraph.description);
        r_setImage(result.hybridGraph.image);
      } catch (error) {
        console.log(error);
      }
    });
  }

  const uploadMetadata = async() => {    
    setSpecText(""); 
    if (m_title === "" || m_title === null) {
      setSpecText("Please input title for minting");  
      return;
    }
    if (m_description === "" || m_description === null) {
      setSpecText("Please input description for minting");  
      return;
    }
    if (m_image === "" || m_image === null) {
      setSpecText("Please upload image for minting");  
      return;
    }
    try {
      m_setMetaUploading(true);
      const ipfsUrl = await uploadToIpfs({name: m_title, description: m_description, imgFile: m_imageFile, creator: selectorWallet.userAddress});   
      m_setMetadata(ipfsUrl);
      m_setMetaUploading(false);
    } catch (error) {
      console.log(error); 
    }
  }

  function calcLeftTime() {       
    console.log("..."); 
    if (dropDate == null) return
    let curDate = new Date()

    const diff = dropDate.getTime() - curDate.getTime()

    let leftTime = "Drop wil be in ";
    if (diff <= 0) {
      leftTime = "Drop is closed";
    } else {
      const days = Math.floor(diff / (3600 * 24 * 1000))
      let r = diff % (3600 * 24 * 1000)
      const hours = Math.floor(r / (3600 * 1000))
      r = r % (3600 * 1000)
      const minutes = Math.floor(r / (60 * 1000))
      r = r % (60 * 1000)
      const seconds = Math.floor(r / 1000)
      
      
      if (days > 0) {
          leftTime += new String(days).padStart(2, '0') + 'd '
      }
      leftTime += new String(hours).padStart(2, '0') + 'h '
      leftTime += new String(minutes).padStart(2, '0') + 'm '
      // leftTime += new String(seconds).padStart(2, '0')
    }        
    setLeftTime(leftTime)                   
  }       

  function formatDate(date: Date) {
    return (
      [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join('-') +
      'T' +
      [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
      ].join(':')
    );
  }

  function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }

  function loopInterval() {
    setIntervalCounter(interValCnt++);
  }

  const addWallet = () => {
    setSpecText(""); 
    if (walletAddress.length == 0)
        return    
    walletAddressList.push(walletAddress)
    setWalletAddress('')
  }

  const deleteWalletAddress = (idx: number) => {
    setSpecText(""); 
    let v = walletAddressList.filter((v, k) => k != idx)
    setWalletAddressList(v)
  }

  const onChange = (event: any) => {
      if (typeof event.target.value === 'undefined')
          return
      setSpecText(""); 
      const value: string = event.target.value
      switch (event.target.name) {
          case 'r_item_url':
              r_setItemUrl(value)
              break
          case 'r_title':
              r_setTitle(value)
              break
          case 'r_description':
              r_setDesc(value)
              break
          case 'm_title':
              m_setTitle(value)
              break
          case 'm_description':
              m_setDesc(value)
              break
          case 'wallet_address':
              setWalletAddress(value)
              break
      }
  }

  const handleChangeM_Resell = () => { 
    setSpecText("");   
    setIsMintSelect(!isMintSelect);        
  }; 

  const handleChangePublic_W = () => { 
    setSpecText(""); 
    setIsPublicSelect(!isPublicSelect);        
  };

  const dateChanged = (date: Date | null) => {
    if (date == null) return;
    date.setHours(23, 59, 59, 999);
    setDropDate(date);
    setSpecText(""); 
  }

  const fileChanged = (e: any) => {      
    try {
      let files = e.target.files
      if (files.length == 0) return;
      let reader = new FileReader()
      reader.onload = (r: any) => {
        setSpecText(""); 
        switch (e.target.name) {
            case 'm_img_input':
                m_setImageFile(files[0]);
                saveImage(files[0], 1);
                break
            case 'r_img_input':
                saveImage(files[0], 2);
                break
        }            
      }        
      reader.readAsDataURL(files[0]) 
    } catch (error) {
      console.log("error", error);
    }      
  }

  //type 1:mint, 2:resell
  const saveImage = async(imageFile: any, type: number) => {  
    try {     
        const formData = new FormData();
        formData.append('uploadImg', imageFile);
        const res = await agent.Upload.uploadSingleImg(formData)            
        let imgUrl = res.upload;
        if (type === 1) {
          m_setImage(imgUrl);
        } else if (type == 2) {
          r_setImage(imgUrl);
        } 
    } catch (err) {
        console.log(err);
    }
  }

  return (
          <div>
              {/* spec text */}
              <div className={(specText==''?'hidden':'' + 'mt-3  mb-3')}>
                  <div className={('w-full mt-3 bg-yellow-100 text-yellow-800 text-sm text-center font-semibold mr-2 px-2.5 py-1.5 rounded dark:bg-yellow-200 dark:text-yellow-900')}>
                      {specText}
                  </div>
              </div>
              {/* mint resell */}
              <div className='flex mt-8'>
                  <div className='mr-3.5 text-xl font-bold'>
                      Mint
                  </div>      
                  <label className="flex items-center cursor-pointer">
                      <div className="relative">
                      <input type="checkbox" id="toggleB" className="sr-only" onChange={handleChangeM_Resell}/>
                      <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                      </div>
                  </label>
                  <div className='ml-3.5 text-xl font-bold'>
                      Resell
                  </div>                    
              </div>

              {/* Mint */}
              {(isMintSelect)&& (
              <>
                  <div>
                      <div className='flex justify-between mt-10'>
                          <div className=''>
                              <div className='flex'>
                                  <div><div className='w-24 text-base text-right px-3 py-2.5 mr-1'>Title</div></div>
                                  <input type="text" name="m_title" value={m_title} onChange={onChange} className="bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-96 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="  " />
                              </div>
                              <div className='flex mt-5'>
                                  <div><div className='w-24 text-base text-right px-3 py-2.5 mr-1'>Description</div></div>
                                  <textarea name="m_description" value={m_description} onChange={onChange} className="bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-96 h-24 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
                              </div>
                          </div>

                          <div className="pt-4 pr-10">
                              <div className="float-right drop-img">
                                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" id="trash" className="w-5 h-5 text-cool-gray-800 dark:text-cool-gray-200 group-hover:text-purple-600 group-focus:text-purple-600 dark:group-hover:text-purple-50 dark:group-focus:text-purple-50">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                      </path> 
                                  </svg>
                                  <img src={m_image} />                    
                                  <input name="m_img_input" type="file" onChange={fileChanged} />
                              </div>
                              <div><div className='w-32 text-base text-center'>Preview Image</div></div>
                          </div>                         
                      </div>

                      {/* MetaData */}
                      <div className='w-full mt-10'>
                        {(m_metadata!=="")&& (
                        <>
                        <div className='flex justify-between'>
                          <div className='w-24 text-base text-right px-3 py-2.5 mr-1'>MetaData</div>
                          <input disabled type="text" name="m_metadata" value={m_metadata} className="w-full bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder=" " />
                        </div>  
                        </>
                        )}                        
                        <div className='flex justify-center mt-4'>                            
                          <button type="button" onClick={uploadMetadata} className="w-40 flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-3 ml-7">
                            <div className={(m_isMetaUploading?'':'hidden')}>
                                <svg  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div> 
                            {m_isMetaUploading? 'is Uploading...' : 'Upload Metadata'}
                          </button>
                        </div>
                      </div> 

                      <div className='border-solid border-t-2 border-gray-300 mt-7'></div>
                      
                      <div className=''>
                          <div className='text-lg font-semibold mt-2.5 ml-2.5'>Details</div>
                          <div className='flex mt-5'>
                              <div><div className='w-24 text-base text-right px-2 py-2.5 mr-1'>Address</div></div>
                              <input disabled type="text" name="r_item_url" value={config.contractAddress} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-96 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="  " />                                

                              <div><div className='w-24 text-base text-right px-2 py-2.5 mr-1'>Token ID</div></div>
                              <input disabled type="text" name="r_item_url" value={selectorTokenData==undefined?0:selectorTokenData.length} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-16 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="  " />                                
                          </div>
                      </div>
                  </div>
              </>
              )}

              {/* Resell */}
              {(!isMintSelect)&& (
              <>
                  <div>
                      <div className='flex justify-between mt-10'>
                          <div><div className='w-24 text-base text-right px-3 py-2.5 mr-1'>Item URL</div></div>
                          <input type="text" name="r_item_url" value={r_itemUrl} onChange={onChange} className="bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="please input load url" />
                          <div className='pr-6'>                            
                            <button type="button" onClick={loadData} className="w-40 flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-3 ml-7">
                              <div className={(r_isloading?'':'hidden')}>
                                  <svg  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                              </div> 
                              {r_isloading? 'is Loading...' : 'Load Data'}
                            </button>
                          </div>
                      </div>

                      <div className='flex justify-between mt-10'>
                          <div className=''>
                              <div className='flex'>
                                  <div><div className='w-24 text-base text-right px-3 py-2.5 mr-1'>Title</div></div>
                                  <input type="text" name="r_title" value={r_title} onChange={onChange} className="bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-96 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="  " />
                              </div>
                              <div className='flex mt-5'>
                                  <div><div className='w-24 text-base text-right px-3 py-2.5 mr-1'>Description</div></div>
                                  <textarea name="r_description" value={r_description} onChange={onChange} className="bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-96 h-24 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">{r_description}</textarea>
                              </div>
                          </div>

                          <div className="pr-10 pt-4">
                              <div className="float-right drop-img">
                                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" id="trash" className="w-5 h-5 text-cool-gray-800 dark:text-cool-gray-200 group-hover:text-purple-600 group-focus:text-purple-600 dark:group-hover:text-purple-50 dark:group-focus:text-purple-50">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                      </path> 
                                  </svg>
                                  <img id="r_img" src={r_image} />                    
                                  <input name="r_img_input" type="file" onChange={fileChanged} />
                              </div>
                              <div><div className='w-32 text-base text-center'>Featured Image</div></div>
                          </div>                            
                      </div>
                  </div>
              </>
              )}

              <div className='border-solid border-t-2 border-gray-300 mt-7'></div>

              {/* public & whitelist */}
              <div className='mt-10'>
                  <div className='flex'>
                      <div className='mr-3.5 text-xl font-bold'>
                          Public
                      </div>                    
                      
                      <label className="flex items-center cursor-pointer">
                          <div className="relative">
                          <input type="checkbox" id="toggleB" className="sr-only" onChange={handleChangePublic_W}/>
                          <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                          <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                          </div>
                      </label>
                      <div className='ml-3.5 text-xl font-bold'>
                          Whitelist
                      </div>                    
                  </div>

                  <div className='flex mt-7'>
                      <div className='pl-1.5'>
                          <DatePicker
                              placeholder="Please select drop date"
                              inputFormat="MM/DD/YYYY"
                              minDate={dayjs(new Date()).toDate()}
                              onChange={(date) => dateChanged(date)}
                          />
                      </div>
                      <div className='ml-3.5 text-xl font-bold pl-2.5'>
                          {leftTime}
                      </div>
                  </div>

                  {(!isPublicSelect)&& (
                  <>
                      <div className='border-solid border-t-2 border-gray-300 mt-7'></div>

                      <div className={"flex flex-col ml-3 w-full" + (emptyWalletAddress ? requiredClassName : '')}>
                          <div className="w-full mt-7">                
                              <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Whitelist</label>                
                          </div>
                          <div className="overflow-x-auto shadow-md sm:rounded-lg">
                              <div className="inline-block min-w-full align-middle dark:bg-gray-800">
                                  <div className="flex p-4">
                                      <div><div className='w-24 text-base text-right px-3 py-2.5 mr-1'>Wallet</div></div>
                                      <div className="relative mt-1">
                                          <input type="text" name="wallet_address" value={walletAddress} onChange={onChange} className="bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Please input wallet address" />
                                      </div>
                                      <button type="button" onClick={addWallet} className="py-2.5 px-5 ml-2 mt-1 mb-1 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Add</button>
                                  </div>
                                  <div className="overflow-hidden">
                                      <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
                                      <thead className="bg-gray-100 dark:bg-gray-700">
                                      <tr>
                                          <th scope="col" className="py-1.5 pl-10 pr-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                          No
                                          </th>
                                          <th scope="col" className="py-1.5 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                                          Address
                                          </th>
                                          <th scope="col" className="p-2">&nbsp;</th>
                                      </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                          {walletAddressList.length > 0 ? walletAddressList.map((address: string, idx: number) => (
                                              <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700">                                        
                                                  <td className="py-2 pl-10 pr-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-white">{idx + 1}</td>
                                                  <td className="py-2 px-6 text-sm font-medium text-gray-500 dark:text-white">{address}</td>
                                                  <td className="py-2 px-6 text-sm font-medium text-right whitespace-nowrap">
                                                  <button type="button" onClick={() => deleteWalletAddress(idx)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
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
                  </>
                  )}
              </div>

              <div className='border-solid border-t-2 border-gray-300 mt-7'></div>
              
              <div className='flex justify-center mb-7'>
                  <div>                    
                    <button type="button" onClick={createDrop} className="w-64 flex items-center justify-center text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-3 mt-5">
                        <div className={(isDropping?'':'hidden')}>
                            <svg  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div> 
                        {isDropping? 'is Dropping ...' : 'Create Drop'}
                    </button>
                  </div>
              </div>
          </div>
  )
}
export default ProfileCreateDrop