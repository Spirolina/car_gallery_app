const Car = require('../models/Car');
const Brand = require('../models/Brand')
const Type = require('../models/Type')
const async = require('async')
const { body, validationResult } = require('express-validator');
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


exports.index = function (req, res, next) {
    async.parallel({
        car_count: function (callback) {
            Car.countDocuments({}, callback)
        },
        brand_count: function (callback) {
            Brand.countDocuments({}, callback)
        },
        type_count: function (callback) {
            Type.countDocuments({}, callback)
        }
    }, function (err, results) {
        if (err) { return next(err) }
        res.render('index', {
            title: "Catalog",
            data : results,
        })
    })
}

exports.car_list = function (req, res, next) {
    Car.find({})
        .populate('brand')
        .populate('type')
        .exec(function (err, result) {
            if (err) { return next(err) }
            res.render('cars', {
                title: 'Cars',
                cars : result
            })
        })
}

exports.car_detail = function (req, res, next) {
    Car.findById(req.params.id)
        .populate('brand')
        .populate('type')
        .exec(function (err, result) {
        if (err) { return next(err) }
        res.render('car_detail',
            {
                title: 'Car detail',
                car : result
        })
        })
}

exports.create_car_get = function (req, res, next) {
    async.parallel({
        brands: function (cb) {
            Brand.find()
            .exec(cb)
        },
        types: function (cb) {
            Type.find()
            .exec(cb)
        }
    },
        function (err, results) {
            if (err) { return next(err) }
            res.render('car_create', {
                title: 'Create car',
                brands: results.brands,
                types: results.types,
            })
    })
}

exports.create_car_post = [
    upload.array('images'),
    body('number_plate').custom(value => {
      
        return Car.find({ number_plate: value }).then(car => {
            if (car.length !== 0) {
                return Promise.reject(`Number Plate: ${value} already in use`);
            }
            
        })
    }),
    body('brand').custom(value => {
        if (value === 'no_brand')
            return Promise.reject('Please select a brand !')
        return true
    }),
    body('year').isLength({ min: 4, max: 4, }).withMessage('Year must be 4 chars long').matches(/\d{4}/).withMessage('Year must contain numbers'),
    body('model').isLength({ min: 1 }).withMessage('model cannot be empty'),
    body('type').isLength({min :1}).withMessage('At least one type should be selected !'),
    function (req, res, next) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            async.parallel({
                brands: function (cb) {
                    Brand.find()
                    .exec(cb)
                },
                types: function (cb) {
                    Type.find()
                    .exec(cb)
                }
            },
                function (err, results) {
                    if (err) { return next(err) }
                    res.render('car_create', {
                        title: 'Create car',
                        brands: results.brands,
                        types: results.types,
                        errors: errors.array(),
                    })
                })
            
            return;
        }

        let images = [];
        for (let i = 0; i < req.files.length; i++) {
            images.push({
                data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.files[i].filename)),
                contentType: 'image/png'
            })
        }
        
        const car = new Car({
            model: req.body.model,
            brand: req.body.brand,
            number_plate: req.body.number_plate,
            year: req.body.year,
            type: req.body.type,
            img : images,

        })

        car.save(function (err, result) {
            if (err) { return next(err) }
            res.redirect('/catalog/cars');
        })
        
    }
]

exports.car_delete = function (req, res, next) {
    Car.findById(req.params.id)
        .populate('brand')
        .exec(function (err, result) {
            if (err) { return next(err) }
            res.render('car_delete', {
                title: 'Delete car',
                car : result
            })
    })
}

exports.car_delete_post = function (req, res, next) {
    Car.findByIdAndRemove(req.params.id, {}, function (err, result) {
        if (err) { return next(err) }
        res.redirect('/catalog/cars');
    })
}

exports.car_edit_get = function (req, res, next) {
    async.parallel({
        car: function (cb) {
            Car.findById(req.params.id)
                .populate('type')
                .populate('brand')
        
        .exec(cb)
        },
        brands: function (cb) {
            Brand.find()
                .exec(cb);
        },
        types: function (cb) {
            Type.find()
                .exec(cb);
        }
    }, function (err, results) {
        for (let i = 0; i < results.car.type.length; i++) {
            for (let j = 0; j < results.types.length; j++) {
                if (results.car.type[i]._id.toString() === results.types[j]._id.toString()) {
                    results.types[j].checked = 'true';
                }
            }
        }

        if (err) { return next(err) }
        res.render('car_create', {
            car: results.car,
            title: 'Edit ' + results.car.title,
            brands: results.brands,
            types: results.types,
        })
   })
   
    
}

exports.car_edit_post = [
    upload.array('images'),
    body('brand').custom(value => {
        if (value === 'no_brand')
            return Promise.reject('Please select a brand !')
        return true
    }),
    body('year').isLength({ min: 4, max: 4, }).withMessage('Year must be 4 chars long').matches(/\d{4}/).withMessage('Year must contain numbers'),
    body('model').isLength({ min: 1 }).withMessage('model cannot be empty'),
    body('type').isLength({min :1}).withMessage('At least one type should be selected !'),
    function (req, res, next) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            async.parallel({
                brands: function (cb) {
                    Brand.find()
                    .exec(cb)
                },
                types: function (cb) {
                    Type.find()
                    .exec(cb)
                },
                car: function (cb) {
                    Car.findById(req.params.id)
                        .populate('brand')
                        .exec(cb);
                }
            },
                function (err, results) {
                    if (err) {
                        return next(err)
                    }
                    
                    res.render('car_create', {
                        title: 'Edit ' +results.car.title,
                        car: results.car,
                        brands: results.brands,
                        types: results.types,
                        errors: errors.array(),
                    })
                })
            
            return;
        }

        let images = [];
        for (let i = 0; i < req.files.length; i++) {
            images.push({
                data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.files[i].filename)),
                contentType: 'image/png'
            })
        }

        Car.findByIdAndUpdate(req.params.id, {
            model: req.body.model,
            brand: req.body.brand,
            number_plate: req.body.number_plate,
            year: req.body.year,
            type: req.body.type,
            img: images,
            _id : req.params.id
        }, {}, function (err, result) {
            if (err) { return next(err) };
            res.redirect(result.url);
        })
        
        

       
    }
]