const express = require('express');
const router = express.Router({ mergeParams: true });
const {upload} = require('../index.js');
const {Station} = require('../models/station');
const {Review} = require('../models/review');
const {validateStation, validateAdmin, validateLogin, wrapAsync, consistency, reqBodyImageFilter} = require('../utils/Validation');
const { Administrator } = require('../models/admin');
const { User } = require('../models/user');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN || 'pk.eyJ1Ijoic2FybGl0ZSIsImEiOiJja2t4cHoxaDUyaWJpMnhueTB3bHBrdXRxIn0.GB70eyL6CmZ14SVdwS9nfw';
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

//=================================
// #1: Posts edit to given station by ID
//=================================
router.put('/edit/:id', upload.array('images'), validateStation, wrapAsync(async (req, res) => { //validateAdmin, validateStation,
    const {id} = req.params;
    if (req.body.name) {
      reqBodyImageFilter(req);
      await Station.findByIdAndUpdate(id, req.body);
      return res.redirect(`/station/${id}`);
    } else res.redirect('/main');
}));
//=================================
// #2: Renders page of chosen station by edit for editing, using newStation form
//=================================
router.get('/edit/:id', wrapAsync(async (req, res) => {

    const reviews = await Review.find({})

    const {id, name} = req.params;
    let station = await Station.find({_id: id});
    station = station[0];
    let stations = await Station.find({});

    res.render('newStation', {station, stations, reviews});
}));
//=================================
// #3: Deletes station document from database based on ID
//=================================
router.delete('/:id', validateLogin, wrapAsync(async (req, res) => {

    const {id} = req.params;
    const station = await Station.findByIdAndDelete(id);

    req.flash('success', `Station "${station.name}" deleted`);
    res.redirect('/main');
}));
//=================================
// #4: Adds new document to Station collection, establishing Mapbox geodata before returning home
//=================================
router.post('/', upload.array('images'), validateStation, wrapAsync(async (req, res) => {//validateAdmin,
    reqBodyImageFilter(req);
    const id = req.session._id;

    const geoData = await geocoder.forwardGeocode({
      query: `${req.body.geometry.location}`,
      limit: 2,
    }).send();

    req.body.geometry.type = geoData.body.features[0].geometry.type;
    req.body.geometry.coordinates = geoData.body.features[0].geometry.coordinates;
  try {
    const station = await new Station(req.body);
    await station.save();

    const creator = await Administrator.findOne({_id: id}) || await User.findOne({_id: id});

    if (!creator.stations)
      creator.stations = [];

    creator.stations.push(station._id);

    if (creator.admin) await Administrator.updateOne({_id: id}, creator);
    else await User.updateOne({_id: id}, creator);

  } catch (e) {
    console.log (e);
  } finally {
    res.redirect('/main');
  }

}));
//=================================
// #5: Form for creating a new station
//=================================
router.get('/new', validateLogin, wrapAsync(async (req, res, next) => {

    res.render('newStation', {station: false, stations: await Station.find({})});
}));
//=================================
// #6: Views main page of the given Staion
//=================================
router.get('/:id', wrapAsync(async (req, res) => {

    const {id} = req.params;
    const currentStation = await Station.findById(id).populate({path: 'reviews', populate:[{path:'user'}, {path:'admin'}, {path:'images'}]})
    .populate('content');

    res.render('station', {currentStation});
}));

module.exports = router;
