
import { TezosToolkit } from "@taquito/taquito";
import {bytes2Char, char2Bytes} from '@taquito/utils';
import { BeaconWallet } from "@taquito/beacon-wallet";
import axios from "axios";
import {NFTStorage, File} from 'nft.storage';

import config from "../config";
import agent from '../agent'

const Tezos = new TezosToolkit(config.RPC_URL);
const w_options = {
    name: config.NAME,
    iconUrl: config.RPC_URL,
    preferredNetwork: config.NETWORK,
};
const wallet = new BeaconWallet(w_options);
Tezos.setWalletProvider(wallet);

export const connectWallet = () => {
	return async (dispatch : any)=>{
		try {
			console.log("connect wallet");
			const activeAccount = await wallet.client.getActiveAccount();
			if (!activeAccount) {
				await wallet.requestPermissions({
					network: {
						type: config.NETWORK,
					},
				});
			}
		
			const userAddress = await wallet.getPKH();
			const userBalance = await Tezos.tz.getBalance(userAddress);
			
			const ret = await agent.Wallet.fetchWalletUser(userAddress as string);
			//If there is no this walllet in DB, add this wallet
			if (ret.wallet == null) {
				const data = {
					address: userAddress,
					name: userAddress,                                
					image: ""
				}
	
				const res: any = await agent.Wallet.addWalletUser(data) 
			} else {
				const payload : any= {};
				payload.user= {
					userAddress: userAddress,
					userBalance: userBalance,
					userName: ret.wallet.name,
					userImage:  ret.wallet.image, 
				};
				dispatch({
					type: "LOGIN_WALLET_USER",
					user: payload.user,
				});
			}
		} catch (error) {
			console.log(error);
			dispatch({
				type: "CONNECT_WALLET_ERROR",
			});
		}
	}
};

export const disconnectWallet = () => {
	 
	return async (dispatch : any) => {
		//await wallet.clearActiveAccount();

		dispatch({
			type: "DISCONNECT_WALLET",
		});

		if (wallet) {
			await wallet.client.removeAllAccounts();
			await wallet.client.removeAllPeers();
			await wallet.client.destroy();
		}
	};
};

export const hex2buf = (hex : any) => {
	return new Uint8Array(
		hex.match(/[\da-f]{2}/gi).map((h : any) => parseInt(h, 16))
	);
};

export const fetchData = () => {
	return async (dispatch : any) => {
		try {
			const responseMarket = await axios.get(
				`https://api.hangzhou2net.tzkt.io/v1/contracts/${config.contractAddress}/bigmaps/data/keys`
			);
			const responseToken = await axios.get(
				`https://api.hangzhou2net.tzkt.io/v1/contracts/${config.tokenAddress}/bigmaps/token_metadata/keys`
			);
			const data_market = responseMarket.data;
			const data_token = responseToken.data;

			let tokenData : any = [];
			for (let i = 0; i < data_market.length; i++) {
				const token_metadata_url  = bytes2Char(data_token[i].value.token_info[""])
					.split("//")[1];

				const token_metadata = await axios.get("https://ipfs.io/ipfs/" + token_metadata_url);

				const data_market_value = data_market[i].value;
				const data_token_data = token_metadata.data;
				tokenData[i] = {
					...data_market_value,
					...data_token_data,
					token_id: data_token[i].value.token_id,
				};
			}
			console.log("Fetch tokendata:" + tokenData);
			dispatch({ type: "SET_TOKEN_DATA", payload: tokenData });
		} catch (e) {
			console.log(e);
		}
	};
};

//UploadToIpfs
const symbol = 'LexT';
const apiKey =		//ev-account
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY4QTMwQzA1ZjY3RTc3NTc3MjI2RjBlOEFmNjQzODA4ZDc2MzA1ZTQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzNDEzMDUwNTkzMCwibmFtZSI6Im1pbnRfdHV0b3JpYWwifQ.jCpzhkEJdFPuM0NtKtJoywX__m6xrJuPRmbagccwarU';
const client = new NFTStorage({token: apiKey});
type uploadProps = { 
	name: string, 
    description: string,
    imgFile: File,
	creator: string,
  }
export const uploadToIpfs = async ({name, description, imgFile, creator} : uploadProps) => {

    const metadata = await client.store({
		symbol: symbol,
		name: name,
		decimals: 0,
        description: description,
        image: new File([imgFile], imgFile.name, {type: imgFile.type}),  		
		
        artifactUri: new File([imgFile], imgFile.name, {type: imgFile.type}),
        displayUri: new File([imgFile], imgFile.name, {type: imgFile.type}),
        thumbnailUri: new File([imgFile], imgFile.name, {type: imgFile.type}),

		isTransferable: true,
		isBooleanAmount: false,
        shouldPreferSymbol: false,
        
		tags: [
		  ""
		],

        creators: [creator],		

		formats: [
		  {
			mimeType: imgFile.type,
			uri: new File([imgFile], imgFile.name, {type: imgFile.type})
		  }
		]
    });
    return metadata.url;
};

type mintProps = {  
    amount: number,
    metadata: any
  }
export const mintNFT = async({ amount, metadata } : mintProps) => {
	const contract = await Tezos.wallet.at(config.contractAddress);

	console.log("contract:" + contract);
	metadata = char2Bytes(metadata);
	console.log("metadata:" + metadata);

	const op = contract.methods.mint(amount, metadata).send();
	console.log("mintNFT-op:" + op);
	return op;
};

type collectProps = { 
	Tezos: TezosToolkit, 
    amount: number,
    id: number
  }
export const collectNFT = ({ Tezos, amount, id } : collectProps) => {
	return async (dispatch :any) => {
		try {
			const contract = await Tezos.wallet.at(config.contractAddress);

			const op = await contract.methods
				.collect(id)
				.send({ mutez: true, amount: amount });
			await op.confirmation();
            dispatch(fetchData());
		} catch (e) {
			console.log(e);
		}
	};
};
