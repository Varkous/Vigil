const express = require('express');
const router = express.Router({ mergeParams: true });
const {upload} = require('../index.js');
const {Station} = require('../models/station');
const {Review} = require('../models/review');
const {validateStation, validateAdmin, validateLogin, wrapAsync, consistency, reqBodyImageFilter} = require('../utils/Validation');
const { Administrator } = require('../models/admin');
const { User } = require('../models/user');
const {detectUser} = require('../utils/info-prov');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN || 'pk.eyJ1Ijoic2FybGl0ZSIsImEiOiJja2t4cHoxaDUyaWJpMnhueTB3bHBrdXRxIn0.GB70eyL6CmZ14SVdwS9nfw';
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

//=================================
// #Edits chosen item based on ID
//=================================
router.put('/:name/:id', wrapAsync(async (req, res) => { //validateAdmin, validateStation,
    const {id} = req.params;

    if (req.body.name) {
      consistency(req.body.affiliates);
      await Station.findByIdAndUpdate(id, req.body);
      return res.redirect('/main');
    }

    res.redirect('/main');
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
router.delete('/:id', validateLogin, wrapAsync(async (req, res) => {

    const {id} = req.params;
    const station = await Station.findByIdAndDelete(id);

    req.flash('success', `${station.name} deleted`);
    res.redirect('/main');
}));
//=================================
// #Adds new document to Station, redirects to home
//=================================
router.post('/', upload.array('images'), validateStation, wrapAsync(async (req, res) => {//validateAdmin,

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

    const creator = await detectUser(req.session._id, Administrator, User);

    if (!creator.stations) {
      creator.model.stations = [];
    }
    await creator.model.stations.push(station);
    await creator.stature === 'admin' ? Administrator.findByIdAndUpdate(creator.model.id, creator.model) : User.findByIdAndUpdate(creator.model.id, creator.model);

    res.redirect('/main');
}));
//=================================
// #Create a new station page
//=================================
router.get('/new', validateLogin, wrapAsync(async (req, res, next) => {

    res.render('newStation', {stations: await Station.find({})});
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
