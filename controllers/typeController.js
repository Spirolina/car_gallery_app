const Car = require('../models/Car')
const Type = require('../models/Type')
const async = require('async')
const { body, validationResult } = require('express-validator');


exports.type_list = function (req, res, next) {
    Type.find()
        .exec(function (err, result) {
            if (err) { return next(err) }
            res.render('types', {
                title: 'Types',
                types : result,
            })
        })
}

exports.type_detail = function (req, res, next) {
    async.parallel({
        cars: function (cb) {
            Car.find({ type: req.params.id })
                .populate('brand')
                .exec(cb)
        },
        type: function (cb) {
            Type.findById(req.params.id)
                .exec(cb)
        }
    }, function (err, results) {
        if (err) { return next(err) };
        res.render('type_detail', {
            title: 'Type detail',
            cars: results.cars,
            type: results.type,
        })
    })
}

exports.type_delete = function (req, res, next) {
    async.parallel({
        cars: function (cb) {
            Car.find({ type: req.params.id })
                .populate('brand')
                .exec(cb)
        },
        type: function (cb) {
            Type.findById(req.params.id)
                .exec(cb)
        }
    }, function (err, results) {
        if (err) { return next(err) }
        res.render('type_delete', {
            title: 'Delete type',
            cars: results.cars,
            type : results.type,
        })
    })
}

exports.type_delete_post = function (req, res, next) {
    Type.findByIdAndRemove(req.params.id, {}, function (err) {
        if (err) { return next(err) }
        res.redirect('/catalog/types');
    })
}

exports.type_create_get = function (req, res, next) {
    res.render('type_create', {
        title: 'Create type'
    })
}

exports.type_create_post = [
    body('type').custom(value => {
        return Type.find({ title_lower: value.toLowerCase() })
            .then(result => {
                console.log(result)
                if (result.length != 0) { return Promise.reject('This type is already exist') }
                return true
            })  
                
                    
    }),
    body('features').isLength({ min: 10 }).withMessage('Features of Type must be at least 10 chars long !'),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('type_create', {
                title: 'Create type',
                errors: errors.array(),
            })
            return;
        }

        const type = new Type({
            title: req.body.type,
            title_lower: req.body.type.toLowerCase(),
            features: req.body.features
        })

        type.save(function (err) {
            if (err) { return next(err) };
            res.redirect('/catalog/types');
        })
    }
]
exports.type_edit_get = function (req, res, next) {
    Type.findById(req.params.id)
        .exec(function (err, result) {
            if (err) { return next(err) }
            res.render('type_create', {
                title: 'Edit ' + result.title,
                carType: result
            })
        })
}

exports.type_edit_post = [
    body('features').isLength({ min: 10 }).withMessage('Features must be at least 10 chars long'),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            Type.findById(req.params.id)
            .exec(function (err, result) {
                if (err) { return next(err) }
                res.render('type_create', {
                    title: 'Edit ' + result.title,
                    carType: result,
                    errors: errors.array()
                })
            })

            return;
        }

        const type = {
            title: req.body.type,
            title_lower: req.body.type.toLowerCase(),
            features: req.body.features,
            _id: req.params.id
        }

        Type.findByIdAndUpdate(req.params.id, type, {}, function (err, result) {
            if (err) { return next(err) }
            res.redirect(result.url);
        })
    }
]