const express = require('express');

const {Station, UserStation} = require('./models/station');
const {User, UserProfile} = require('./models/user');
const {UserArticle} = require('./models/article');
const {UserReview} = require('./models/review');
const { Administrator } = require('./models/admin');
// const sanitizeHTML = require('sanitize-html');
// const BaseJoi = require('joi');
const AppError = require('./AppError');
const flash = require('connect-flash');

/*Uses the Joi schema to compare and validate the properties of the req.body object,
and verify if the types (integers, arrays, etc.) and names are correct via passing 
it through "joi" object*/ 
module.exports.ValidateProfile = async (req, res, next) => {
    const {error} = await UserProfile.validate(req.body);

    if (error){
        const message = error.details.map(err => err.message).join(',');
        throw new AppError(message, 400);
    } 
    else { 
    next(error);
    }
}

//Same as above but for Station submissions
module.exports.ValidateStation = async (req, res, next) => {
    const {error} = await UserStation.validate(req.body);
    
    if (error){
        const message = error.details.map(err => err.message).join(',');
        throw new AppError(message, 400);
    } 
    else { 
    next(error);
    }
}

//Same as above but for Article submissions
module.exports.ValidateArticle = async (req, res, next) => {
    const {error} = await UserArticle.validate(req.body);

    if (error){
        const message = error.details.map(err => err.message).join(',');
        throw new AppError(message, 400);
    } 
    else { 
    next(error);
    }
}

//Same as above but for Review submission
module.exports.ValidateReview = async (req, res, next) => {
    const currentUser = await User.findById(req.session._id) || await Administrator.findById(req.session._id);
    req.body.user = currentUser.id;
    req.body.rating = parseInt(req.body.rating);

    const {error} = await UserReview.validate(req.body);

    if (error){
        const message = error.details.map(err => err.message).join(',');
        throw new AppError(message, 400);
    } 
    else { 
    next(error);
    }
}

//Returns and stores any errors caught by middleware that this function is "wrapped" around (basically all route handlers)
module.exports.wrapAsync = function (fn){
    return function (req, res, next){
        fn(req, res, next).catch(e => next(e));
    }
}

module.exports.validateLogin = async (req, res, next) =>{
    if (req.session._id){
        req.session.canDelete = true;
        next();
    } else {
        req.flash('warning', 'Login required for access');
        req.session.originalUrl = req.originalUrl;
        return res.redirect('/login');
    }
}
module.exports.validateAdmin = async (req, res, next) =>{
    console.log(req.originalUrl);
    if (req.session.canDelete === true && req.originalUrl.includes('DELETE')){
        return next();
    }
    if(!req.isAuthenticated())
    {
        req.flash('error', 'Administration privledges required');
        req.session.originalUrl = req.originalUrl;
        return res.redirect('/admin');
    }
    next();
}

module.exports.codeword = async (req, res, next) =>{
    const {codeQuery} = req.query;

    if(codeQuery !== 'You are Elliot'){
      req.flash('error', 'Incorrect. Say it again. Louder');
      return res.redirect('/')
    } else {
        req.approved = true;
        next();  
    }
}

// Used by Auto-Station-Creation (Seed Database tab button/function below this one) to ensure shareholders/restrictions have no duplicate entries by user. 
module.exports.consistency = function (array) { 

    /*Verifies if array is actually an array/object.*/
    if (typeof(array) === 'object')
    {
        /*Forgot some of it. But "element" is the iterated item. firstIndex is "element's" index NUMBER. We created our own (nextIndex") so we can always compare the concurrently scanned element with the NEXT element, and remove it (nextIndex) if it is the same. At the end we return a single element, since it all simply being filtered and we do one at a time.*/
        array = array.filter( (element, firstIndex, array) => {
            for (let nextIndex = firstIndex + 1; nextIndex <= array.length + 1; nextIndex++)
            {
                if(array[nextIndex] === element)
                {
                    array.splice(nextIndex, 1);
                }
            }
            return array[firstIndex];
        });
    }
    return array;
    }

    const seedDB = require('./seeds/seeds');    

//----------------------------------------------------------------------------------------
/* This function is just for checking the user's input from submiting "Seed Database" or "Clear Database" on the navbar, and clarifying typos of the input */

module.exports.checkInput = async function (req, res, next){
    const currentAdmin = await Administrator.findById(req.user.id);

    function removeFalseChars(string){
        const specialChars = [" ", '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', '[', '{', ']', '}', ';', ':', '"', "'", ',', '<', '.', '>', '/', '?', '|'];

        for (let letter of string){
            if (letter === specialChars.filter(char => char === letter).toString()){
                string = string.replace(letter, "");
        }
    }
    return string;
}
    const query = req.query;
    const {seed} = req.query;
/* We've gathered the query/input data, which should ONLY be either "seed" or "clear"<---(no need to destructure this one) */

/* If "seed" exists and was extracted from "req.query", then we also check it to verify there was a number at the END through Parse check ---- */
    if (seed){
        if (parseInt(seed[seed.length - 1]))
        {
/*--- If so, then we parse it and re-initialize to JUST the number through inputAmount, which the user should've put at the end of string "seed".*/
        inputAmount = parseInt(seed[seed.length - 1]) || 1;
        }
    }
    
/* Even though it's just one object item, 'still had to do a For Loop */
    for (let command in query){
        query[command] = removeFalseChars(query[command]);

/* If there was no input, throw error by doing next();*/
        if(!query[command] && !query[command].length)
        {
            console.log('The fuck?');
            break;
        }

/* If both the KEY and VALUE(command) of query were "clear" (in otherwords, the codeword was exactly "clear"), then we Clear the collection of all Stations! */
        else if (command === 'clear' && query[command] === 'clear'){   
            const allStations = await Station.find({});   
            for (let station of allStations){
                await Station.findByIdAndDelete(station.id);
            }
            req.flash('warning', 'All Stations have been decommissioned');
            //await Station.deleteMany({}).then(req.flash('error', 'All Stations have been decommissioned'));
        }  

/* And if the key and the first FOUR letters of the value/command was "seed", we will Seed the database based on the "inputAmount", which is 1 by default 
Each Station seeded will also be added to the creator's collection (the current logged-in Administrator, declared at the top of this function) */
        else if (command === 'seed' && query[command].slice(0, 4) === 'seed' && typeof(inputAmount) === 'number'){
            for(let integer = 0; integer < inputAmount; integer++){
                const newStation = await seedDB('station', req.user);
 
                await currentAdmin.stations.push(newStation);
                await Administrator.findByIdAndUpdate(currentAdmin.id, currentAdmin);
            }
            req.flash('success',`${inputAmount} Stations deployed`);
        }   else {
            return next(new AppError('What the fuck?', 401))}
    }
    next();
}
//----------------------------------------------------------------------------------------
module.exports.reqBodyImageFilter = (req) => {
    // if(req.body.rating){
    //     req.body.user = req.session._id             
    //     req.body.admin = req.session._id;
    // }

        req.body.images = [];
    if(req.files){
        for (let image of req.files){
            let url = image.path;
            let filename = image.filename;
            req.body.images.push({url, filename});
        } 
    }
    return req;
}

// const sanitizeHTML = require('sanitize-html');
// const BaseJoi = require('joi');

// const extension = (joi) => ({
//     type: 'string',
//     base: joi.string(),
//     messages: {
//         'string.escapeHTML': '{{#label}} must not include any HTML'
//     },
//     rules:{
//         escapeHTML: {
//             validate(value, helpers){
//                 const clean = sanitizeHtml (value, {
//                     allowedTags: [],
//                     allowedAttributes: {}
//                 });
//                 if(clean !== value){ return helpers.error('string.HTML', {value})};
//                 return clean;

//             }
//         }
//     },


// })

// const Joi = BaseJoi.extend(extension);
// module.exports.Joi;