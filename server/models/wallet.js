var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');

var WalletSchema = new mongoose.Schema({
    slug: {type: String, lowercase: true, unique: true},
    address: String,
    name: String,
    image: String
}, {timestamps: true})

WalletSchema.plugin(uniqueValidator, {message: 'is already taken'});

WalletSchema.pre('validate', function(next) {
    if (!this.slug) {
        this.slugify()
    }

    next()
})

WalletSchema.methods.slugify = function() {
    this.slug = slug(this.address) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
}

WalletSchema.methods.toJSONFor = function() {
    return {
        slug: this.slug,
        address: this.address,
        name: this.name,
        image: this.image,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('wallet', WalletSchema)
