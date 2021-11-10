const sanitizeHTML = require('sanitize-html');

  module.exports.getFileSize = function (filesize) {
  // If filesize is at least Delta digits and less than Gamma digits, read by kilobytes
    if (filesize > 999 && filesize < 1000000)//Divide filesize (bytes) by Delta
     filesize = Math.floor(filesize / 1000) + ' Kilobytes';

  // If filesize is at least Gamma digits and less than Juliett digits, read by megabytes, which would cap at 999 megabytes
    else if (filesize > 999999 && filesize < 1000000000) //Divide filesize (bytes) by Gamma
     filesize = Math.round((filesize / 1000000).toFixed(1)) + ' Megabytes';

  // If filesize is Juliet digits or more, read by gigabytes
    else if (filesize > 999999999)  //Divide filesize (bytes) by Juliet
     filesize = (filesize / 1000000000).toFixed(1) + ' Gigabytes';

    else filesize = filesize + ' Bytes';

    return filesize;
  };

  module.exports.escapeHTML = (joi) => ({
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
  });

  // const {Administrator} = require('../models/admin');
  // const {User} = require('../models/user');
  module.exports.detectUser = async function (id, Administrator, User) {

    if (await Administrator.findById(id)) {
      return {
        stature: 'admin',
        model: Administrator.findById(id)
      };
    } else if (await User.findById(id)) {
      return {
        stature: 'user',
        model: User.findById(id)
      };
    } else {
      req.flash('error', 'User creator not detected');
      throw new AppError('User creator not found');
    }
  };
// module.exports = {
//   getFileSize: function (filesize) {
//   // If filesize is at least Delta digits and less than Gamma digits, read by kilobytes
//     if (filesize > 999 && filesize < 1000000)//Divide filesize (bytes) by Delta
//      filesize = Math.floor(filesize / 1000) + ' Kilobytes';
//
//   // If filesize is at least Gamma digits and less than Juliett digits, read by megabytes, which would cap at 999 megabytes
//     else if (filesize > 999999 && filesize < 1000000000) //Divide filesize (bytes) by Gamma
//      filesize = Math.round((filesize / 1000000).toFixed(1)) + ' Megabytes';
//
//   // If filesize is Juliet digits or more, read by gigabytes
//     else if (filesize > 999999999)  //Divide filesize (bytes) by Juliet
//      filesize = (filesize / 1000000000).toFixed(1) + ' Gigabytes';
//
//     else filesize = filesize + ' Bytes';
//
//     return filesize;
//   },
//   detectUser: async function (id) {
//     if (await Administrator.findById(id)) {
//       return 'admin'
//     } else if (await User.findById(id)) {
//       return 'user'
//     } else {
//       req.flash('error', 'User creator not detected');
//       throw new AppError('User creator not found');
//     }
//   },
//   escapeHTML: (joi) => ({
//     type: 'string',
//     base: joi.string(),
//     messages: {
//         'string.escapeHTML': '{{#label}} must not include any HTML!'
//     },
//     rules:{
//       escapeHTML: {
//         validate(value, helpers){
//             const clean = sanitizeHTML (value, {
//                 allowedTags: [],
//                 allowedAttributes: {}
//             });
//             if(clean !== value){ return helpers.error('string.escapeHTML', {value})};
//             return clean;
//         }
//       }
//     },
//   }),
// };
