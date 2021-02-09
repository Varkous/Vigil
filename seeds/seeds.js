const {geocoder} = require('../index');
const {consistency} = require('../Validation');
const {Station} = require('../models/station')
const cities = require('./cities');
const titles = require('./titles');

const success = (data) => console.log('Success:', data);
const failure = (error) => console.log('Problem:', error);

// mongoose.connect('mongodb://localhost:27017/Ecobelly', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true
// }); 



 const makeCollection = async function (station, creator)
 {
    function Randomizer (number, plus) {
        if(plus){
            return Math.floor(Math.random() * number + plus);
        }
        return Math.floor(Math.random() * number);
    }

    const zipNumber = () => {
        const randomNumbers = [];
        for(i = 0; i < 5; i++){
            let num = Randomizer(9, 1);
            randomNumbers.push(num);
        }
        return randomNumbers.join('');
    }

    const random1000 = Randomizer(1000);
    const imageInteger = Randomizer(500000)
    const firsttitle = Randomizer(titles.firstTitle.length);
    const lasttitle = Randomizer(titles.lastTitle.length);
    const mandates = Randomizer(titles.mandates.length);
    const affiliates = Randomizer(titles.affiliates.length);

    const randomCityState = [`${cities[random1000].city}`, `${cities[random1000].state}`];
    const geoData = await geocoder.forwardGeocode({
        query: `${randomCityState}`,
        limit: 2,
    }).send();

        station = await new Station ({
        name: `${titles.firstTitle[firsttitle]} ${titles.lastTitle[lasttitle]}`,
        geometry: { 
            location: [`${cities[random1000].city}`, `${cities[random1000].state}`],
            type: "Point",
            coordinates: geoData.body.features[0].geometry.coordinates,
        },
        zipcode: await zipNumber(),
        owner: creator.username,
        images: [{
            url: `https://source.unsplash.com/collection/483251?sig=${imageInteger}`,
            filename: null,
        }],
        description: 'In Celtic mythology, the warrior goddess known as the Morrighan often appears in the form of a crow or raven or is seen accompanied by a group of them. Typically, these birds appear in groups of three, and they are seen as a sign that the Morrighan is watching—or possibly getting ready to pay someone a visit. In some tales of the Welsh myth cycle, the Mabinogion, the raven is a harbinger of death. Witches and sorcerers were believed to have the ability to transform themselves into ravens and fly away, thus enabling them to evade capture.',
        
        restrictions: [`${titles.mandates[mandates]}`, 
        `${titles.mandates[Randomizer(titles.mandates.length)]}`, 
        `${titles.mandates[Randomizer(titles.mandates.length)]}`],

        shareholders: [`${titles.affiliates[affiliates]}`, 
        `${titles.affiliates[Randomizer(titles.affiliates.length)]}`, 
        `${titles.affiliates[Randomizer(titles.affiliates.length)]}`],
    })
//====================================================
//This mess of a function serves one main purpose: To take an array of an OBJECT, filter it and return it back to ensure consistency in the properties of the newly created Station object. It does this by removing duplicates in the passed array, and additionally, if one of the elements of the array is specifcally "None" or "Union", then all other elements in the array besides those two will be filtered out for the new object. Otherwise, it will pass the consistency check and remain unchanged.
//====================================================
    function consistency(array) { 

        array = array.filter( (element, firstIndex, array) => {
            if (element === 'None') {
                array.splice(0);
                return array.indexOf(element);
            }
            if (element === 'Union') {
                array[0] = 'Union';
                array.splice(1);
                return array.indexOf('Union');
            }
            for (let nextIndex = firstIndex + 1; nextIndex <= array.length + 1; nextIndex++)
            {
                if(array[nextIndex] === element)
                {
                    array.splice(firstIndex, 1);
                   // array.splice(nextIndex, 1);
                }
            }

            return array.indexOf(element);
            // return array[firstIndex];
        });
    return array;
    }
// ----------------------------------------------------
        consistency(station.restrictions);
        consistency(station.shareholders);
    return station.save().catch(failure);
}
module.exports = makeCollection;