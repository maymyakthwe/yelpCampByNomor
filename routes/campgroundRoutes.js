const express = require('express');
const router = express.Router();
const Campground = require('../models/campgrounds')
const catchAsync = require('../utils/catchAsync')
const {validateCampground,isLoggedIn,isAuthor} = require('../utils/middleware');
const multer  = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({ storage })
const {cloudinary} = require('../cloudinary/index')


router.get('/',catchAsync(async(req,res)=>{
    const campgrounds= await Campground.find({});
    res.render('campgrounds/campgrounds',{campgrounds});
}))

router.get('/new',isLoggedIn,(req,res)=>{ 
    res.render('campgrounds/new');
})


router.post('/',isLoggedIn,upload.array('image'),validateCampground,catchAsync(async(req,res)=>{
    const newCamp = new Campground(req.body.campground)
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename}));
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log(newCamp);
    req.flash('success','successfully made a new campground!')
    res.redirect(`/campgrounds/${newCamp._id}`)
}))

// router.post('/',upload.array('image'),(req,res)=>{
//     console.log(req.files)
//     res.send('pls work');
// })


// router.post('/',isLoggedIn,validateCampground,catchAsync(async(req,res)=>{
//     console.log(req.body)
//     const newCamp = new Campground(req.body.campground)
//     newCamp.author = req.user._id;
//     await newCamp.save();
//     req.flash('success','successfully made a new campground!')
//     res.redirect('/campgrounds')
// }))

router.get('/:id',catchAsync(async (req,res)=>{
    const foundcamp = await Campground.findById(req.params.id).populate('reviews').populate('author');
    if(!foundcamp){
        req.flash('error','Cannot find campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/details',{foundcamp})
}))

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(async(req,res)=>{
    const {id}=req.params;
    const foundcamp = await Campground.findById(id);
    if(!foundcamp){
        req.flash('error','Cannot find campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{foundcamp})
}))



router.put('/:id',isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(async(req,res)=>{
    const {id}=req.params;
    const foundcamp = await Campground.findByIdAndUpdate(id,req.body.campground,{runValidators:true,new:true});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename}));
    foundcamp.images.push(...imgs);
    await foundcamp.save();
    if(req.body.deleteImages){
        for( let file of req.body.deleteImages){
            await cloudinary.uploader.destroy(file);
        }
        await foundcamp.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }
    req.flash('success','successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:id',isLoggedIn,isAuthor,catchAsync(async(req,res)=>{
    const {id}=req.params;
    const foundcamp=await Campground.findByIdAndDelete(id);
    req.flash('success','successfully deleted campground!')
    res.redirect('/campgrounds')
}))

module.exports = router;
