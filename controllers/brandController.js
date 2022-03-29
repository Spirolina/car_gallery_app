const Brand = require('../models/Brand')
const Car = require('../models/Car')
const async = require('async')
const { body, validationResult } = require('express-validator')
var multer = require('multer');
var fs = require('fs');
const path = require('path');

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '/uploads/'))
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});
var upload = multer({ storage: storage });


exports.brand_list = function (req, res, next) {
    Brand.find()
        .exec(function (err, result) {
            if (err) { return next(err) };
            res.render('brands', {
                title: 'Brands',
                brands: result
            })
        })
}


exports.brand_detail = function (req, res, next) {
    async.parallel({
        cars: function (cb) {
            Car.find({ brand: req.params.id })
                .populate('brand')
                .exec(cb)
        },
        brand: function (cb) {
            Brand.findById(req.params.id)
                .exec(cb)
        }
    }, function (err, results) {
        if (err) { return next(err) };
        res.render('brand_detail', {
            title: 'Brand detail',
            brand: results.brand,
            cars: results.cars,
        })
    })
}

exports.brand_delete = function (req, res, next) {
    async.parallel({
        brand: function (cb) {
            Brand.findById(req.params.id)
                .exec(cb)
        },
        cars: function (cb) {
            Car.find({ brand: req.params.id })
                .populate('brand')
                .exec(cb)
        }
    }, function (err, results) {
        if (err) { return next(err) };
        res.render('brand_delete', {
            title: 'Delete brand',
            brand: results.brand,
            cars : results.cars,
        })
    })
}

exports.brand_delete_post = function (req, res, next) {
    Brand.findByIdAndRemove(req.params.id, {}, function (err) {
        if (err) { return next(err) }
        res.redirect('/catalog/brands');
    })
}

exports.brand_create_get = function (req, res, next) {
    res.render('brand_create', {
        title : 'Create brand',
    })
}

exports.brand_create_post = [
    upload.single('logo'),
    body('brand').custom(value => {
        return Brand.find({ title_lower : value.toLowerCase() }).then(brands => {
            if(brands.length != 0) return Promise.reject('This brand is already exist')
        })
    }),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('brand_create', {
                title : 'Create brand',
                errors: errors.array(),
            })
            return;
        }

        const brand = new Brand({
            title: req.body.brand,
            title_lower : req.body.brand.toLowerCase(),
            img: {
                data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                contentType: 'image/png',
            }
        })

        brand.save(function (err) {
            if (err) { return next(err) }
            res.redirect('/catalog/brands')
        })
    }
]

exports.brand_edit_get = function (req, res, next) {
    async.parallel({
        brand: function (cb) {
            Brand.findById(req.params.id)
                .exec(cb)
        },
        cars: function (cb) {
            Car.find({ brand: req.params.id })
                .exec(cb)
        }
    }, function (err, results) {
        if (err) { return next(err) }
        res.render('brand_create', {
            title: 'Edit ' + results.brand.title,
            cars: results.cars,
            brand: results.brand
        })
    })
}

exports.brand_edit_post = [
    upload.single('logo'),
    function (req, res, next) {
        console.log(req.file)
        if (!req.file) {
            async.parallel({
                brand: function (cb) {
                    Brand.findById(req.params.id)
                        .exec(cb)
                },
                cars: function (cb) {
                    Car.find({ brand: req.params.id })
                        .exec(cb)
                }
            }, function (err, results) {
                if (err) { return next(err) }
                res.render('brand_create', {
                    title: 'Edit ' + results.brand.title,
                    cars: results.cars,
                    brand: results.brand,
                    errors: [{
                        msg: 'Logo must be uploaded'
                    }]
                })
            })

            return;
    }
    
        
        const brand = {
        title: req.body.brand,
        title_lower : req.body.brand.toLowerCase(),
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png',
        }, 
        _id: req.params.id
    }

        Brand.findByIdAndUpdate(req.params.id, brand, {},
            function (err, result) {
        if (err) { return next(err) }
        res.redirect(result.url);
     })
}] 