import { Dispatch, useEffect, SetStateAction } from 'react'
import { connect } from 'react-redux'
import pic from "../images/mypic.jpg";

import { TezosToolkit } from '@taquito/taquito'

type featuredProps = {
    Tezos: TezosToolkit,
    setBeaconConnection: Dispatch<SetStateAction<boolean>>, 
    setPublicToken: Dispatch<SetStateAction<string | null>>,
    dispatch: any
}

const FeaturedDrop = ({
    Tezos,
    setBeaconConnection,
    setPublicToken,
    dispatch
}: featuredProps): JSX.Element => {

    return (
        <div className='flex'>
            <p>Featured Drops</p>
            <img src={pic} />
        </div>
    )
}

export default connect(null, null)(FeaturedDrop)