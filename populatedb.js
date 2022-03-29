#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Car = require('./models/Car')
var Brand = require('./models/Brand')
var Type = require('./models/Type')
var CarInstance = require('./models/Carinstance')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var cars = []
var types = []
var brands = []
var carinstances = []

function  carCreate(model, number_plate, brand, year, type, cb) {
  cardetail = {model , number_plate, brand, year, type}

  
  var car = new Car(cardetail);
       
  car.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New car: ' + car);
    cars.push(car)
    cb(null, car)
  }  );
}

function typeCreate(title, cb) {
  var type = new Type({ title, });
       
  type.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Type: ' + type);
    types.push(type)
    cb(null, type);
  }   );
}

function brandCreate(title, cb) {
  branddetail = { 
    title: title,
  }

    
  var brand = new Brand(branddetail);    
  brand.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Brand: ' + brand);
    brands.push(brand)
    cb(null, brand)
  }  );
}


function carInstanceCreate(car, status, due_back, cb) {
  carinstancedetail = { 
      car,
      status, 
      due_back
  }    
    
  var carinstance = new CarInstance(carinstancedetail);    
  carinstance.save(function (err) {
    if (err) {
      console.log('ERROR CREATING CarInstance: ' + carinstance);
      cb(err, null)
      return
    }
    console.log('New CarInstance: ' + carinstance);
    carinstances.push(carinstance)
      cb(null, car);
  }  );
}


function createTypeBrands(cb) {
    async.series([
        function(callback) {
          brandCreate('Ford', callback);
        },
        function(callback) {
            brandCreate('Mercedes', callback);
        },
        function(callback) {
            brandCreate('BMW', callback);
        },
        function(callback) {
            brandCreate('Audi', callback);
        },
        function(callback) {
          typeCreate("SUV", callback);
        },
        function(callback) {
            typeCreate("SPORT", callback);
        },
        function(callback) {
            typeCreate("COMFORT", callback);
        },
        ],
        // optional callback
        cb);
}


function createCars(cb) {
    async.parallel([
        function(callback) {
          carCreate('focus', '25-FF-FFF', brands[0], 2011, types[0], callback);
        },
        function(callback) {
            carCreate('test', '25-TT-FFF', brands[1], 2015, types[1], callback);
        },
        function(callback) {
            carCreate('tes2', '25-FF-FDF', brands[0], 2011, types[0], callback);
        },
        function(callback) {
            carCreate('test3', '20-FF-FFF', brands[0], 2011, types[0], callback);
        },
        function(callback) {
            carCreate('MODEL', '25-FF-SDF', brands[0], 2011, types[0], callback);
        },
        function(callback) {
            carCreate('MODEL 2', '25-FF-AAF', brands[0], 2011, types[0], callback);
        },
        function(callback) {
            carCreate('MODEL 3', '25-BB-FFF', brands[0], 2011, types[0], callback);
        }
        ],
        // optional callback
        cb);
}


function createCarInstances(cb) {
    async.parallel([
        function(callback) {
          carInstanceCreate(cars[0], 'Avaliable', Date.now() , callback)
        },
        function(callback) {
            carInstanceCreate(cars[1], 'Avaliable', Date.now()  , callback)
        },
        function(callback) {
            carInstanceCreate(cars[3], 'Maintanince', Date.now()  , callback)
        },
        function(callback) {
            carInstanceCreate(cars[2], 'Avaliable', Date.now()  , callback)
        },
        function(callback) {
            carInstanceCreate(cars[0], 'Loaned', Date.now()  , callback)
        },
        function(callback) {
            carInstanceCreate(cars[1], 'Avaliable', Date.now()  , callback)
        },
        function(callback) {
            carInstanceCreate(cars[2], 'Avaliable', Date.now()  , callback)
        },
        function(callback) {
            carInstanceCreate(cars[1], 'Avaliable', Date.now()  , callback)
        },
        function(callback) {
            carInstanceCreate(cars[0], 'Avaliable', Date.now()  , callback)
        },
        function(callback) {
            carInstanceCreate(cars[4], 'Avaliable', Date.now()  , callback)
        },
        function(callback) {
            carInstanceCreate(cars[0], 'Avaliable', Date.now()  , callback)
        }
        ],
        // Optional callback
        cb);
}



async.series([
    createTypeBrands,
    createCars,
    createCarInstances
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('BOOKInstances: '+carinstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



