const mongoose = require('mongoose');
//const {Joi} = require('../Validation');
// const Joi = require('joi');
const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include any HTML!'
    },
    rules:{
        escapeHTML: {
            validate(value, helpers){
                const clean = sanitizeHTML (value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if(clean !== value){ return helpers.error('string.escapeHTML', {value})};
                return clean;

            }
        }
    },


})

const Joi = BaseJoi.extend(extension);





const opts = { toJSON: { virtuals: true } };
const schematic = new mongoose.Schema({
    name: {
        type: String,
        //required: true,        
        required: [true, 'Christ sake, gotta call it something.']         
        },
    geometry: {
        location:{
            type:[String],
            required: true,
        },
        type:{
            type: String,
            enum:['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],        
            required: [true, 'Must be a location, fool.']    
        }       
        },
    zipcode: {
            type: Number,
            required: true,
        },
    owner: {
        type: String,
       //required: true,        
        required: [true, "For fuck's sake franky, SOMEBODY made this thing."]          
        },
    images: [
        {
            url: String,
            filename: String,
        }
    ],
    description: String,
    restrictions: [String],
    shareholders: [String],
    reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}]
}, opts);

/* Dunno why it's called a virtual. It's basically a "phonecall function" that our model generally doesn't recognize, and uses it only to capture and transform a value from one of the properties (in this case, the description, shortening it to 50 characters), and adding it as a secret data type to the model under the given name "properties"*/

schematic.virtual('properties.markerText').get(function() {
    return `<a href="station/${this._id}">${this.name}</a>
    <p class="text-dark">${this.description.substring(0, 50)}...</p>`
});

schematic.post('findOneAndDelete', stationDeletion);

module.exports.Station = new mongoose.model('Station', schematic);
module.exports.UserStation = Joi.object({
        name: Joi.string().min(3).max(30).required().escapeHTML(),
        geometry: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
        zipcode: Joi.number().integer().precision(5),
        images: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
        owner: Joi.string().min(3).max(30).required(),
        description: Joi.string().min(30).max(600),
        restrictions: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
        shareholders: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
        //reviews: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
});
// console.log(this.UserStation);


const { Review } = require('./review');
const { User } = require('./user');
const { Administrator } = require('./admin');
const {cloudinary} = require('../cloudinary');

async function stationDeletion(doc){

    if (doc){

        if  (doc.images[0].filename){
            await cloudinary.uploader.destroy(doc.images[0].filename);
        } 
        //console.log('After cloudinary');
        /*Before anything else, we remove the Station from the owner (an Adminstrator's) database*/
        let givenAdmin = await Administrator.find({username: doc.owner});
        
        //Don't know why I had to do this. But I did.
        givenAdmin = await givenAdmin[0];
        //console.log('After givenAdmin');

        await givenAdmin.stations.splice(givenAdmin.stations.indexOf(doc._id), 1);
        await Administrator.findByIdAndUpdate(givenAdmin.id, givenAdmin);
        //console.log('After admin update');

        /*Loops through each review of the Station being deleted, and locates the User who made the given review
        through ID retrieval, and deletes the review from their profile database via "splice", in addition to deleting it from
        the Station itself at the end (which happens AFTER the loop. 'Turned out to be important)*/
        for (let id of doc.reviews)
        {
            //console.log('Start of for loop');
            let reviewOf = await Review.findById(id);
            let givenUser = await User.findById(reviewOf.user) || await Administrator.findById(reviewOf.admin);

            //console.log('After given user');
            if(givenUser){

                await givenUser.reviews.splice(givenUser.reviews.indexOf(id));
                if (givenUser.admin === true){
                    await Administrator.findByIdAndUpdate(givenUser.id, givenUser);
                } else {
                await User.findByIdAndUpdate(givenUser.id, givenUser);
                }
            }

            await Review.findByIdAndDelete(id);
        }

        // await Review.deleteMany({
        //     _id: {
        //         $in: doc.reviews
        //     }
        // })
    }
}




