const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TypeSchema = new Schema({
    title: { type: mongoose.SchemaTypes.String, required: true },
    title_lower : {type: mongoose.SchemaTypes.String, unique:true, required: true},
    features: {type:mongoose.SchemaTypes.String},
});


TypeSchema.virtual('url').get(function () {
    return `/catalog/types/${this._id}`
})



module.exports = mongoose.model('Type', TypeSchema);
