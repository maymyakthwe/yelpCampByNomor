const {descriptors, places} = require('./seedHelpers')
const cities = require('./cities')
const Campground = require('../models/campgrounds')

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelpCamp');




const seedDb = async()=>{
    await Campground.deleteMany({});
    for(let i = 0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000)
        const ran = array => array[Math.floor(Math.random()*array.length)]
        const camp = new Campground({
            author:'6382fbcd2234856bf32eba02',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${ran(descriptors)} ${ran(places)}`,
            images:[
                  {
                    url: 'https://res.cloudinary.com/dxng2buuq/image/upload/v1670431064/YelpCamp/ykn4n74m0cbcfzpwhbtm.jpg',
                    filename: 'YelpCamp/ykn4n74m0cbcfzpwhbtm',
                  },
                  {
                    url: 'https://res.cloudinary.com/dxng2buuq/image/upload/v1670431066/YelpCamp/c0kliiu3jvdh0un5rcrn.jpg',
                    filename: 'YelpCamp/c0kliiu3jvdh0un5rcrn',
                  },
                  {
                    url: 'https://res.cloudinary.com/dxng2buuq/image/upload/v1670431071/YelpCamp/sfgigoj1vv5qoa6tkeyr.jpg',
                    filename: 'YelpCamp/sfgigoj1vv5qoa6tkeyr',
                  },
                  {
                    url: 'https://res.cloudinary.com/dxng2buuq/image/upload/v1670431076/YelpCamp/c9herqgptu1ayfis3r5p.jpg',
                    filename: 'YelpCamp/c9herqgptu1ayfis3r5p',
                  }
                ],
            description:'ahhh i dunno what to write here so here we go again, me making stuffs up just to get a good long enough paragraph.',
            price: Math.floor(Math.random()*20)+10
        })
        camp.save();
        console.log(camp)
    }
}
seedDb();