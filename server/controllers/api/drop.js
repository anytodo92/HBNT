var mongoose = require('mongoose')
var Drop = mongoose.model('drop')

exports.addDrop = (req, res, next) => {
    var { contract_address, token_id, title, description, metadata, items, image, wallets, dropTime } = { ...req.body }
   
    const data = {
        contract_address: contract_address,
        token_id: token_id,
        title: title,
        description: description,
        metadata: metadata,    
        items: items,
        image: image,
        wallets: wallets,
        dropTime: new Date(dropTime + 'Z')
    }

    var drop = new Drop(data)

    return drop.save().then(function() {
        return res.json({
            drop: drop.toJSONFor()
        })
    })
}

exports.fetchDrop = (req, res, next) => {
    const dropId = req.params.dropId
    
    console.log(dropId)
    
    Drop.findOne({_id: dropId}).then((drop) => {
        if (!drop) {
            return res.json({
                drop: null
            })
        }

        return res.json({
            drop: drop.toJSONFor()
        })
    })
}

exports.getFeaturedDrop = (req, res, next) => {
    Drop.aggregate([ 
        {
            $sort: { createdAt: 1 }
        }, 
        {
            $limit: 1 
        }
    ]).exec((error, result) => {
        if (error || !result.length) {
            return res.json({
                drop: null
            })
        }
        
        return res.json({
            drop: {
                id: result[0]._id,
                slug: result[0].slug,
                contract_address: result[0].contract_address,
                token_id: result[0].token_id,
                title: result[0].title,
                description: result[0].description,
                metadata: result[0].metadata,
                items: result[0].items,
                image: result[0].image,
                wallets: result[0].wallets,
                dropTime: result[0].dropTime,
                bids: result[0].bids,
                createdAt: result[0].createdAt,
                updatedAt: result[0].updatedAt
            }
        })
    })
}

exports.getDropList = (req, res, next) => {
    console.log('get all')

    Drop.aggregate([ 
        {
            $sort: { createdAt: -1 }
        }
    ]).exec((error, result) => {
        if (error || !result.length) {
            return res.json({
                drop: null
            })
        }
        
        const list = result.map((v, k) => {            
            return {
                id: v._id,
                slug: v.slug,
                contract_address: v.contract_address,
                token_id: v.token_id,
                title: v.title,
                description: v.description,
                metadata: v.metadata, 
                items: v.items,
                image: v.image,
                wallets: v.wallets,
                dropTime: v.dropTime,
                bids: v.bids,
                createdAt: v.createdAt,
                updatedAt: v.updatedAt
            }
        })

        return res.json({ drops: list })
    })
}

exports.updateBids = function (req, res, next) {
    let bids = req.body.bids
    let dropId = req.body.dropId

    Drop.findOneAndUpdate({ _id: dropId }, { bids: bids }, { new: true })
    .then((drop) => {
        if (!drop) {
            return res.json({
                drop: null
            })
        }

        return res.json({
            drop: drop.toJSONFor()
        })
    })
}
 
