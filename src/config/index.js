import { NetworkType } from "@airgap/beacon-sdk";

const config = {
    //DApp Name
    NAME : "Henbane",
    ICON : "https://tezostaquito.io/img/favicon.png",

    //Contract
    // contractAddress : "KT1QkV7fQSaHXeAPDrR7rrpfNE9GdLUUnFKK",    //-ok-tutorial
    // tokenAddress: "KT198XHSk97qKG4Ykj1RDdHwEruZ6C6QE6Ee",        //-ok   

    // contractAddress: "KT1HSpzJZkWAXFtjJCcrcYxtDnyo3QD6Xh3T",     //-ok-hangzhou-5.9:
    // tokenAddress: "KT1NrfTu3FjBt2E73gqkLE92vaVoEzSyiwXH",        //-ok-hangzhou-5.9:
    contractAddress: "KT1QUueTtEDarpiQHxudZ4SkLU1CqDbYSmPU",        //-ok-hangzhou:
    tokenAddress: "KT1LTgP2iw4ehBiMrwFXv6FZgmhiDKyTkKbL",           //-ok-hangzhou:

    // add Network ENV variable
    // RPC_URL : "https://ithacanet.smartpy.io",
    // NETWORK : NetworkType.HANGZHOUNET
    
    // RPC_URL : "https://hangzhounet.api.tez.ie",
    RPC_URL : "https://hangzhounet.smartpy.io",
    NETWORK : NetworkType.HANGZHOUNET,

    // https://mainnet.smartpy.io
    // RPC_URL : "https://mainnet.api.tez.ie",
    // NETWORK : NetworkType.MAINNET

    opengraphApiKey: "a5502868-e087-421e-8edf-ed0ce129483c",
}

export default config;