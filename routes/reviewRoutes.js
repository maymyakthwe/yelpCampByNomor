const express = require('express');
const router = express.Router({mergeParams:true});

const catchAsync = require('../utils/catchAsync')
const {isLoggedIn,isReviewAuthor,validateReview} = require('../utils/middleware');
const Campground=require('../models/campgrounds')
const Review = require('../models/reviews');

router.post('/',isLoggedIn,validateReview,catchAsync(async(req,res)=>{
    const {id}=req.params;
    const campground = await Campground.findById(id).populate('reviews');
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','successfully made a new review!')
    res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async(req,res)=>{
    const {id,reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;