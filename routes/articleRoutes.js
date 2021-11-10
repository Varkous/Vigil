const express = require('express');
const router = express.Router({ mergeParams: true });
const { Station } = require('../models/station');
const { Article } = require('../models/article');
const { validateArticle, validateAdmin, validateLogin, wrapAsync} = require('../utils/Validation');
const { Administrator } = require('../models/admin');
const { User } = require('../models/user');
const { upload, store } = require('../index.js');


router.delete('/:id', wrapAsync(async (req, res, next) => {
    const {id} = await req.params;

    await Article.findByIdAndDelete(id);

    res.redirect('/main');
}));
//=================================
// #4.5: Post Article to the current user's database, add count to session and Flash the count because why not.
//=================================
router.post('/', validateLogin, upload.any(), validateArticle, wrapAsync(async (req, res, next) => {

  const newArticle = await new Article(req.body);
  await newArticle.save();

  const currentUser = await User.findById(req.session._id) || await Administrator.findById(req.session._id);
  await currentUser.articles.push(newArticle);

  if (currentUser.admin) await Administrator.findByIdAndUpdate(currentUser.id, currentUser);
  else await User.findByIdAndUpdate(currentUser.id, currentUser);
  res.redirect(`/article/${newArticle.id}`);
}));
//=================================
// #4: Create a new article
//=================================
router.get('/new', validateLogin, wrapAsync(async (req, res, next) => {

    const stations = await Station.find({});

    res.render('newArticle', {stations});
}));
//=================================
// #4: Create a new article
//=================================
router.get('/all', validateLogin, wrapAsync(async (req, res, next) => {
    let Articles = await Article.find({}).populate('admin').populate('user').populate('reference');
    res.render('allArticles', {Articles});
}));
//=================================
// #4.5: Post Article to the current user's database, add count to session and Flash the count because why not.
//=================================
router.get('/:id', validateLogin, wrapAsync(async (req, res, next) => {
    const {id} = req.params;

    const currentArticle = await Article.findById(id).populate(['user', 'admin']).populate('reference');
    currentArticle.links = currentArticle.links.map( l => `<a href="${l.url}">${l.headnote}</a>`);

    res.render('article', {currentArticle});
}));
module.exports = router;
