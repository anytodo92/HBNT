var mongoose = require('mongoose')
var Wallet = mongoose.model('wallet')

exports.addWalletUser = (req, res, next) => {
    var { address, name, image }  = { ...req.body }
    const data = {
        address: address,
        name: name,
        image: image,
    }

    Wallet.findOne({ address: address }).then(function (wallet) {
        if (wallet) {
            return res.json({ error: 'duplicate' })
        }

        var wallet = new Wallet(data)

        return wallet.save().then(function(){
            return res.json({
                wallet: wallet.toJSONFor()
            })
        })
    })    
}

exports.fetchWalletUser = (req, res, next) => {
    const address = req.params.address
    
    console.log("server-fetchWalletUser:" + address);
    
    Wallet.findOne({address: address}).then((wallet) => {
        if (!wallet) {
            return res.json({
                wallet: null
            })
        }

        return res.json({
            wallet: wallet.toJSONFor()
        })
    })
}

exports.updateWalletUserName = function (req, res, next) {
    let address = req.body.address
    let name = req.body.name

    Wallet.findOneAndUpdate({ address: address }, { name: name }, { new: true })
    .then((wallet) => {
        if (!wallet) {
            return res.json({
                wallet: null
            })
        }

        return res.json({
            wallet: wallet.toJSONFor()
        })
    })
}

exports.updateWalletUserImage = function (req, res, next) {
    let address = req.body.address
    let image = req.body.image

    Wallet.findOneAndUpdate({ address: address }, { image: image }, { new: true })
    .then((wallet) => {
        if (!wallet) {
            return res.json({
                wallet: null
            })
        }

        return res.json({
            wallet: wallet.toJSONFor()
        })
    })
}
