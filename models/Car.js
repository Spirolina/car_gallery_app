const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const CarSchema = new Schema({
    model: { type: String, required: true },
    number_plate: { type: String, unique: true, required: true },
    brand: { type: mongoose.SchemaTypes.ObjectId, ref: 'Brand', required: true },
    year: { type: Number, required: true },
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Type' }],
    img: [
        {
            data: { type: mongoose.SchemaTypes.Buffer, required: true },
            contentType : { type: mongoose.SchemaTypes.String, required: true }  
            
        }
    ]
});


CarSchema.virtual('url').get(function () {
    return `/catalog/cars/${this._id}`
})

CarSchema.virtual('title').get(function () {
    return `${this.brand.title} - ${this.model} - ${this.year}`;
})

module.exports = mongoose.model('Car', CarSchema);
