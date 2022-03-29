const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BrandSchema = new Schema({
    title: { type: String, required: true },
    title_lower : {type: mongoose.SchemaTypes.String, unique: true, required: true},
    img: {
        data: { type: mongoose.SchemaTypes.Buffer, required: true },
        contentType : { type: mongoose.SchemaTypes.String, required: true }  }
});



BrandSchema.virtual('url').get(function () {
    return `/catalog/brands/${this._id}`
})



module.exports = mongoose.model('Brand', BrandSchema);
