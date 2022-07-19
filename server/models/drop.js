var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');

const BidSchema = new mongoose.Schema({ amount: Number, wallet: String })

var DropSchema = new mongoose.Schema({
    slug: {type: String, lowercase: true, unique: true},
    contract_address: String,
    token_id: String,
    title: String,
    description: String,
    metadata: String,    
    items: [{ type: String }],
    image: String,
    wallets: [{ type: String }],
    bids: [BidSchema],
    dropTime: Date
}, {timestamps: true})

DropSchema.plugin(uniqueValidator, {message: 'is already taken'});

DropSchema.pre('validate', function(next) {
    if (!this.slug) {
        this.slugify()
    }

    next()
})

DropSchema.methods.slugify = function() {
    this.slug = slug(this.contract_address + this.token_id) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
}

DropSchema.methods.toJSONFor = function() {
    return {
        id: this._id,
        slug: this.slug,
        contract_address: this.contract_address,
        token_id: this.token_id,
        title: this.title,
        description: this.description,
        metadata: this.metadata,
        items: this.items,
        image: this.image,
        wallets: this.wallets,
        bids: this.bids,
        dropTime: this.dropTime,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('drop', DropSchema)
