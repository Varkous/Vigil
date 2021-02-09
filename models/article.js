const mongoose = require('mongoose');
const Joi = require('joi');

photoSchema = new mongoose.Schema ({
    url: String,
    filename: String,
    explanation: String,
})

photoSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
});

const schematic = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    user: [{type: mongoose.Schema.Types.ObjectID, ref: "User"}],
    admin: [{type: mongoose.Schema.Types.ObjectID, ref: "Administrator"}],
    photos: [photoSchema],
    date: Date,
    explanation: [String],
})

schematic.post('findOneAndDelete', deleteReferences);

module.exports.Article = new mongoose.model('Article', schematic);
module.exports.UserArticle = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    user: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
    admin: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
    photos: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
    date: Joi.date(),
    explanation: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
})

const {cloudinary} = require('../cloudinary');
const {User} = require('./user');
const {Administrator} = require('./admin');

async function deleteReferences (doc) {
    if (doc){

        for(let image of doc.photos){
            await cloudinary.uploader.destroy(image.filename);
        }
        const givenUser = await User.findOne({_id: {$in: doc.user}}) || await Administrator.findOne({_id: {$in: doc.admin}});

        await givenUser.articles.splice(givenUser.articles.indexOf(doc.id));

        if (givenUser.admin === true){
            await Administrator.findByIdAndUpdate(givenUser.id, givenUser);
        } else {
        await User.findByIdAndUpdate(givenUser.id, givenUser);
        }
    }
}
