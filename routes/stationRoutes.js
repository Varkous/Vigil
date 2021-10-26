const express = require('express');
const router = express.Router({ mergeParams: true });
const {upload} = require('../index.js');
const {Station} = require('../models/station');
const {Review} = require('../models/review');
const {ValidateStation, validateAdmin, validateLogin, wrapAsync, consistency, reqBodyImageFilter} = require('../utils/Validation');
const { Administrator } = require('../models/admin');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN || 'pk.eyJ1Ijoic2FybGl0ZSIsImEiOiJja2t4cHoxaDUyaWJpMnhueTB3bHBrdXRxIn0.GB70eyL6CmZ14SVdwS9nfw';
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

//=================================
// #Edits chosen item based on ID
//=================================
router.put('/:name/:id', wrapAsync(async (req, res) => { //validateAdmin, ValidateStation,
    const {id} = req.params;

    if (req.body.name) {
      consistency(req.body.affiliates);
      await Station.findByIdAndUpdate(id, req.body);
      return res.redirect('/');
    }

    res.redirect('/');
}));
//=================================
// #Renders page of chosen station item from the list, and renders appropriate page
//=================================
router.get('/:name/:id', wrapAsync(async (req, res) => {

    const reviews = await Review.find({})

    const {id, name} = req.params;
    let station = await Station.find({name: name});
    station = station[0];
    let stations = await Station.find({});

    res.render('newStation', {station, stations, reviews});
}));
//=================================
// #Deletes chosen item from database based on ID
//=================================
router.delete('/:id', validateAdmin, wrapAsync(async (req, res) => {

    const {id} = req.params;
    const station = await Station.findByIdAndDelete(id);
    console.log (station);
    req.flash('success', `${station.name} deleted`);
    res.redirect('/');
}));
//=================================
// #Adds new document to Station, redirects to home
//=================================
router.post('/', upload.array('images'), ValidateStation, wrapAsync(async (req, res) => {//validateAdmin,

    // return console.log (req.body);
    reqBodyImageFilter(req);
    consistency(req.body.affiliates);
    consistency(req.body.warnings);
    consistency(req.body.industry);

    const geoData = await geocoder.forwardGeocode({
      query: `${req.body.geometry.location}`,
      limit: 2,
    }).send();

    req.body.geometry.type = geoData.body.features[0].geometry.type;
    req.body.geometry.coordinates = geoData.body.features[0].geometry.coordinates;

    const station = await new Station(req.body);
    await station.save();

    const currentAdmin = await Administrator.findById(req.session._id);
    await currentAdmin.stations.push(station);
    await Administrator.findByIdAndUpdate(currentAdmin.id, currentAdmin);

    res.redirect('../');
}));
//=================================
// #Create a new station page
//=================================
router.get('/new', validateLogin, wrapAsync(async (req, res, next) => {

    res.render('newStation');
}));
//=================================
// #Views main page of the given Staion
//=================================
router.get('/:id', wrapAsync(async (req, res) => {

    const {id} = req.params;
    const currentStation = await Station.findById(id).populate({path: 'reviews', populate:[{path:'user'}, {path:'admin'}, {path:'images'}]})
    .populate('content');

    res.render('station', {currentStation});
}));

module.exports = router;
