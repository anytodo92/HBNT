import { Dispatch, useEffect, SetStateAction } from 'react'
import { connect } from 'react-redux'

import { TezosToolkit } from '@taquito/taquito'

type upcomingProps = {
    Tezos: TezosToolkit,
    dispatch: any
  }

const UpcomingDrops = ({
    Tezos,
    dispatch
}: upcomingProps): JSX.Element => {

    return (
        <div className='flex'>
            <h1>Upcoming Drops</h1>
        </div>
    )
}

export default connect(null, null)(UpcomingDrops)