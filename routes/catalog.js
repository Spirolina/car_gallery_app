var express = require('express');
var router = express.Router();
const carController = require('../controllers/carController');
const brandController = require('../controllers/brandController')
const typeController = require('../controllers/typeController')



router.get('/', carController.index);

router.get('/cars', carController.car_list);

router.get('/cars/create', carController.create_car_get);
router.post('/cars/create', carController.create_car_post);


router.get('/cars/:id', carController.car_detail);

router.get('/cars/:id/uploadimage', function (req, res, next) {
    res.render('cars_uploadimage', {id:req.params.id})
})



router.get('/cars/:id/delete', carController.car_delete)
router.post('/cars/:id/delete', carController.car_delete_post)

router.get('/cars/:id/edit', carController.car_edit_get);
router.post('/cars/:id/edit', carController.car_edit_post);


router.get('/brands', brandController.brand_list)
router.get('/brands/create', brandController.brand_create_get);
router.post('/brands/create', brandController.brand_create_post);

router.get('/brands/:id', brandController.brand_detail);
router.get('/brands/:id/edit', brandController.brand_edit_get);
router.post('/brands/:id/edit', brandController.brand_edit_post);

router.get('/brands/:id/delete', brandController.brand_delete);
router.post('/brands/:id/delete', brandController.brand_delete_post);


router.get('/types',typeController.type_list )

router.get('/types/create', typeController.type_create_get);
router.post('/types/create', typeController.type_create_post);


router.get('/types/:id', typeController.type_detail)

router.get('/types/:id/delete', typeController.type_delete);
router.post('/types/:id/delete', typeController.type_delete_post)

router.get('/types/:id/edit', typeController.type_edit_get)
router.post('/types/:id/edit', typeController.type_edit_post)




module.exports = router;