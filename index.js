
if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
String.prototype.includesAny = function () {
	for (let str of arguments) {
	  if (Array.isArray(str)) {
	    for (let s of str) if (this.includes(str)) return true;
	  } else if (this.includes(str)) return true;
  };
}
// Our models/schematics. These take posted/patched information sent by users (through query inputs) and create new documents with them. They must come first so we don't stir up the "circular dependency" bullshit.
process.modelNames = [];
const {User} = require('./models/user');
const {Administrator} = require('./models/admin');
const {Article} = require('./models/article');
const {Review} = require('./models/review');
const {Station} = require('./models/station');

// Foundational packages, without these (with the exceptions of "cookieParser", "flash" and "helmet") our app would do jack shit.
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const {urlencoded} = require('express');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoDBStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const helmet = require('helmet');


// Our try/catch functions, Database and Port.
// mongoose.connect('mongodb://localhost:27017/movieList?readPreference=primary&appname=MongoDB%20Compass&ssl=false', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true}).catch (error => console.log("Success.", error));
mongoose.connect('mongodb+srv://Arclite:Snakefist1@vigil.jauhs.mongodb.net/Vigil?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true}).catch(error => console.log("Success.", error));

const PORT = process.env.PORT || 4000;
const secret = process.env.SECRET;

module.exports.store = new MongoDBStore ({
    mongooseConnection: mongoose.connection,
    collection: 'session',
    // url: 'mongodb://localhost:27017/movieList?readPreference=primary&appname=MongoDB%20Compass&ssl=false',
    url: 'mongodb+srv://Arclite:Snakefist1@vigil.jauhs.mongodb.net/Vigil?retryWrites=true&w=majority',
    secret,
    //Delay before session updates
    touchAfter: 24 * 60 * 60,
}).on('error', function (e) {
    console.log("Database error: ", e);
});



// These are all external packages that store our cloudinary and mapbox data, along with ouur keys
const {cloudinary} = require('./utils/cloudinary');
const {storage} = require('./utils/cloudinary');
const multer = require('multer');
module.exports.upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1000 * 1000,
    files: 5,
    allowedFormats: ['jpg', 'jpeg', 'png', 'jfif', 'ico']}
  });
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN || 'pk.eyJ1Ijoic2FybGl0ZSIsImEiOiJja2t4cHoxaDUyaWJpMnhueTB3bHBrdXRxIn0.GB70eyL6CmZ14SVdwS9nfw';
module.exports.geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const {getFileSize} = require('./utils/info-prov.js');

// Used to authenticate users, hash passwords and supplement the req/res bodies with new methods
const passport = require('passport');
const LocalStrategy = require('passport-local');

// All specific to this web application: Our own Models, Middleware, and Error Handlers.
const AppError = require('./utils/AppError');
const authRoutes = require('./routes/authRoutes');
const stationRoutes = require('./routes/stationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const articleRoutes = require('./routes/articleRoutes');
const {wrapAsync} = require('./utils/Validation');

// Not sure how it works, but declares the "views" directory as base directory for reference, where our .ejs files are. "ejs" is HTML augmented that receives back-end JavaScript.
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Despite being declared above, they must be initialized and called within "app.use" before their functionality can be recognized.
const browserToolsAndResources = [
    urlencoded({extended: true}),
    methodOverride('_method'),
    cookieParser(),
    session({ name: 'session', store: module.exports.store, session: 'usefulshitter', secret,  resave: false, saveUninitialized: true, expires: 30 * 60 * 1000, cookie: { secure: false, maxAge: 30 * 60 * 1000}}),
    flash(),
    helmet(),
    //Folder Management/Server-side Images ----->
    express.static(path.join(__dirname, 'Vigil')),
    express.static(path.join(__dirname, 'views')),
    express.static(path.join(__dirname, 'views/scripts')),
    express.static(path.join(__dirname, 'views/css')),
    express.static(path.join(__dirname, 'Pictures')),
    express.static(path.join(__dirname, 'views/css/fonts')),
    express.static(path.join(__dirname, 'views/images')),
]
app.use(browserToolsAndResources);

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",
    "https://code.jquery.com/jquery-3.5.1.slim.min.js",
    //"https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "http://unpkg.com/",

];
const styleSrcUrls = [

    //"https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "http://unpkg.com/",
    // "https://fonts.googleapis.com/",
    //"https://use.fontawesome.com/",
];
const connectSrcUrls = [
"http://unpkg.com/",
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
  // "https://fonts.googleapis.com/",
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/ddipe8thd/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://source.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Gave this a name "GlobalData" to clarify its functionality: It stores database collections, the current User, and any flash warnings within EVERY response of all middlewares.
app.use(async function GlobalData (req, res, next) {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.users = await User.find({});
  res.locals.admins = await Administrator.find({});
  if (req.session.id) {
    res.locals.User = await Administrator.findById(req.session._id) || await User.findById(req.session._id);
  }
  next();
});


/*Route integrators */
app.use( (req, res, next) => {
  if (req.method.includesAny('GET', 'get', 'DELETE', 'delete')) {
    req.session.prev = req.originalUrl;
  }
  return next();
});
/*== #1 ==*/ app.use('/', authRoutes);
/*== #2 ==*/ app.use('/station', stationRoutes);
/*== #3 ==*/ app.use('/review', reviewRoutes);
/*== #4 ==*/ app.use('/article', articleRoutes);


app.get('/main', wrapAsync( async (req, res, next) => {
  let stations = await Station.find({}).populate('article_refs');
  const stationCount = stations.length;

  res.render('allStations', {stations, stationCount});
}))
//=================================
// #2: Main/Home page render
//=================================
app.get('/', wrapAsync(async (req, res) => {
    req.session.canDelete = true;
    req.session.originalUrl = null;
    res.cookie('test', 'nationalacrobat');

    if (req.user  || req.session.user) {
      res.redirect('/main');
    } else {
      res.render('home', {stations: await Station.find()});
    }

}));
//=================================
// #1: Error page redirect
//=================================
app.get('*', wrapAsync(async (req, res, next) => {

    throw new AppError("Page does not exist...", 404);
}))
//=================================
// #null: Error Handling
//=================================
app.use( async (err, req, res, next) => {
    let {status = 401, message = "Sigh", stack} = err;
    const prev = req.session.prev || req.originalUrl;

    console.log (err);
    if (err.code) {
      let msg = ['error', 'Problem'];
      let uploadRules = module.exports.upload.limits;

      if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'FILE_TOO_LARGE')
        msg = ['error', `Upload exceeds max file size (${getFileSize(uploadRules.fileSize)})`];
      else if (err.code === 'LIMIT_FILE_COUNT')
        msg = ['error', `Too many files being uploaded, ${uploadRules.files} is the limit`];
      else if (err.code === 'LIMIT_UNEXPECTED_FILE')
        msg = ['error', `Can only upload images with formats: "jpg/jpeg, jfif, png, ico"`];
      else if (err.code === 11000)
        msg = ['error', 'That email is already in use']
      else msg = ['error', message];

      req.flash(...msg);
      return res.redirect(prev);
    }
    // ----------------------------------
    if (message.includes('Cast to ObjectId failed')) {
      let item = process.modelNames.filter( name => message.includes(name)) || ['Item'];
      message = `${item.toString()} not found. Either it was renamed, or no longer exists.`
    }
    res.render('error', {status, message, stack, prev});
})
//=================================
// #null: Server Side response
//=================================
app.listen(PORT, () => {
    console.log("Listening on Port:", PORT);
})
