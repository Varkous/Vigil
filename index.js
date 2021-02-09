
if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

// Our models/schematics. These take posted/patched information sent by users (through query inputs) and create new documents with them. They must come first so we don't stir up the "circular dependency" bullshit.
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
const database = process.env.DB_INFO //|| 'mongodb://localhost:27017/Ecobelly';
const success = (data) => console.log("Success.", data);
const failure = (error) => console.log("Success.", error);
mongoose.connect(`${database}`, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true}).catch (failure);
const PORT = process.env.PORT || 4000;
const secret = process.env.SECRET;
const store = new MongoDBStore ({
    url: database,
    secret,
    touchAfter: 24 * 60 * 60,
})
store.on('error', function (e) {
    console.log("Database error: ", e);

})


// These are all external packages that store our cloudinary and mapbox data, along with ouur keys
const {cloudinary} = require('./cloudinary');
const {storage} = require('./cloudinary');
const multer = require('multer');
const upload = multer({storage});
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
module.exports.geocoder = mbxGeocoding({ accessToken: mapBoxToken });


// Used to authenticate users, hash passwords and supplement the req/res bodies with new methods
const passport = require('passport');
const LocalStrategy = require('passport-local');


// All specific to this web application: Our own Models, Middleware, and Error Handlers.
const AppError = require('./AppError');
const stationRoutes = require('./routes/stationRoutes')
const authRoutes = require('./routes/authRoutes')
const {ValidateArticle, ValidateReview, validateLogin, validateAdmin, wrapAsync, checkInput, reqBodyImageFilter} = require('./Validation');


// Not sure how it works, but declares the "views" directory as base directory for reference, where our .ejs files are. "ejs" is HTML augmented that receives back-end JavaScript.
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Folder Management/Server-side Images ----->
app.use(express.static(path.join(__dirname, 'Ecobelly')));
app.use(express.static('views'));
app.use(express.static('../Pictures'));

// Despite being declared above, they must be initialized and called within "app.use" before their functionality can be recognized.
const browserTools = [ 
    urlencoded({extended: true}),
    methodOverride('_method'), 
    cookieParser(), 
    session({ store, session: 'blah', secret,  resave: false,  saveUninitialized: true, cookie: { secure: false,}}), 
    flash(), 
    helmet()
]
app.use(browserTools);



const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",
    "https://code.jquery.com/jquery-3.5.1.slim.min.js",
    //"https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",

];
const styleSrcUrls = [

    //"https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    //"https://fonts.googleapis.com/",
    //"https://use.fontawesome.com/",
];
const connectSrcUrls = [

    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
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



// No idea how this crap really works. All just for convenience of linking to Google/Twitter/Facebook emails eventually. Just using it for Administrators instead of Users.
app.use(passport.initialize());
app.use(passport.session());

// Gave this a name "GlobalData" to clarify its functionality: It stores database collections, the current User, and any flash warnings within EVERY response of all middlewares.
app.use(async function GlobalData (req, res, next) {
    // "res.locals" will send anything to its right (. operator) to any page/template along with the client, so that the EJS/HTML can reference it for use on the given page.
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.warning = req.flash('warning');
    res.locals.stations = await Station.find({}).populate({path: 'reviews', populate:{path:'user'}}).populate('content');

    res.locals.users = await User.find({});
    res.locals.admins = await Administrator.find({});
    if(req.session.id){
        res.locals.registeredUser = await User.findById(req.session._id);
        res.locals.registeredAdmin = await Administrator.findById(req.session._id);
    }
    next();
});

/*Route integrators */
/*== #1 ==*/app.use('/station', stationRoutes);
/*== #2 ==*/app.use('/', authRoutes);


// ------------------------------------------ Custom Middleware & Routes ---------------------------------------------------------
//=================================
// #7: Wipes all documents from the current database's collection. Basically a post request.
//=================================
app.get('/clear', validateAdmin, checkInput, wrapAsync(async (req, res, next) => {

    res.redirect('/');
}))
//=================================
// #6: Adds a new item to database. Basically a post request.
//=================================
app.get('/seed', validateAdmin, checkInput, wrapAsync(async (req, res, next) => {
    inputAmount = 1;

    res.cookie('randomCookie', { maxAge: 900000, httpOnly: true });

    res.redirect('/');
}))
//=================================
// #5: View the blogs of a given user
//=================================
app.delete('/article/:id', wrapAsync(async (req, res, next) => {
    const {id} = await req.params;
    
    await Article.findByIdAndDelete(id);

    res.redirect('/');
}))
//=================================
// #4.5: Post Article to the current user's database, add count to session and Flash the count because why not.
//=================================
app.post('/article', validateLogin, upload.array('photos'), ValidateArticle, wrapAsync(async (req, res, next) => {
    req.body.photos = [];

    if(req.files){
        for (let i = 0; i < req.files.length; i++){
            let url = req.files[i].path;
            let filename = req.files[i].filename;
            let explanation = req.body.explanation[i];
            req.body.photos.push({url, filename, explanation});
        } 
    }
    
    const newArticle = await new Article(req.body);
    await newArticle.save();

    const currentUser = await User.findById(req.session._id) || await Administrator.findById(req.session._id);
    await currentUser.articles.push(newArticle);
    if (currentUser.admin){
        await Administrator.findByIdAndUpdate(currentUser.id, currentUser);
    } else {
    await User.findByIdAndUpdate(currentUser.id, currentUser);
    }

    // if(req.session.count){
    //     req.session.count += 1;
    // } else {
    //     req.session.count = 1;
    // }
    // let message = `Article #${req.session.count} posted`;
    // req.flash('success', `${message}`);

    res.redirect('/');
}))
//=================================
// #4: Create a new article
//=================================
app.get('/article/new', validateLogin, wrapAsync(async (req, res, next) => {
    res.render('article');
}))
//=================================
// #4.5: Post Article to the current user's database, add count to session and Flash the count because why not.
//=================================
app.get('/article/:id', wrapAsync(async (req, res, next) => {
    const {id} = req.params;
    const currentStation = await Station.findById(id).populate({path: 'reviews', populate:[{path:'user'}, {path:'admin'}, {path:'images'}]}).populate('content');

    const currentArticle = await Article.findById(id).populate(['user', 'admin']);
    res.render('blogs', {currentArticle, currentStation});
}))
//=================================
// #3.8: Adds a review to the targeted station, linked to the User who's currently logged in by ID.
//=================================
app.delete('/review/:id', validateLogin, validateAdmin, wrapAsync(async (req, res) => {
    const {id} = req.params;

    await Review.findByIdAndDelete(id);
    res.redirect('/');

}))
//=================================
// #3.5: Adds a review to the targeted station, linked to the User who's currently logged in by ID.
//=================================
app.put('/review/:edit/:id', validateLogin, upload.array('images'), ValidateReview, wrapAsync(async (req, res) => {

    const originalUrl = req.session.originalUrl || '/';
    const {id} = req.params;
    const currentReview = await Review.findById(id);

    for(let image of currentReview.images){
        await cloudinary.uploader.destroy(image.filename);
    }
    currentReview.images = [];
    await Review.findByIdAndUpdate(id, currentReview);

    reqBodyImageFilter(req);

    await Review.findByIdAndUpdate(id, req.body);
    res.redirect(originalUrl);
}))
//=================================
// #3.5: Adds a review to the targeted station, linked to the User who's currently logged in by ID.
//=================================
app.put('/review/:id', validateLogin, upload.array('images'), ValidateReview, wrapAsync(async (req, res) => {
        
    const {id} = req.params;
    const currentStation = await Station.findById(id);

    reqBodyImageFilter(req);
    
    const newReview = await new Review(req.body);
    await newReview.save();
    const currentUser = await User.findById(req.session._id) || await Administrator.findById(req.session._id);
    currentUser.reviews.push(newReview);

    if (currentUser.admin){
        await Administrator.findByIdAndUpdate(currentUser.id, currentUser);
    } else {
        await User.findByIdAndUpdate(currentUser.id, currentUser);
    }
    currentStation.reviews.push(newReview);
    await Station.findByIdAndUpdate(id, currentStation);

    res.redirect(`/station/${id}`);
}))
//=================================
// #3: Adds a review to the targeted station
//=================================
app.get('/review/new/:id', validateLogin, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const station = await Station.findById(id);

    res.render('review', {station});
}))
//=================================
// #2: Error page redirect
//=================================
app.get('/:error', wrapAsync(async (req, res, next) => {

    throw new AppError("Page doesn't exist...", 404);
}))
//=================================
// #1: Main/Home page render
//=================================
app.get('/', wrapAsync(async (req, res) => {
    req.session.canDelete = true;
    req.session.originalUrl = null;
    res.cookie('test', 'nationalacrobat');

    let howManyStations = await Station.find({});
    let stationCount = howManyStations.length;

    res.render('home', {stationCount});
}))
//=================================
// #null: Error Handling
//=================================
app.use( async (err, req, res, next) => {
    const {status = 401, message = "Sigh", stack} = err;

    res.render('error', {status, message, stack});
})
//=================================
// #null: Server Side response
//=================================
app.listen(PORT, () => {
    console.log("Listening on Port:", PORT);
})
