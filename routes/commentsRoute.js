const express = require('express');
const router = express.Router();

const commentsDb = require('../models/commentsModel');
const navLinksDb = require('../models/navLinksModel');
const authentication = require('./login');

router.put('/:category/:article', async(req,res) =>{

    if(Object.keys(req.cookies).length === 0){
        await res.json({success:false,message:"Login to perform this action"})
    }
    else{
        const category = req.params.category;
        const article = req.params.article;
        const commentInfo = req.body;

        const comments = await commentsDb.update({category:category, article:article},commentInfo,{
            returnUpdatedDocs:true, upsert:true });

        res.status(200).json({comments:comments , success:true})
    }

});

router.get('/:category/:article',async (req,res)=>{
    const category = req.params.category;
    const article = req.params.article;
    console.log(category);
    try{
        const commentDetails = await commentsDb.findOne({category:category,article:article});
        res.status(200).json({comments:commentDetails.comments, likes:commentDetails.likes})
    }
    catch(err){
        res.status(500).json({error :"internal error"});
        //next();
    }

});

router.get('/:category',async (req,res)=>{
    const category = req.params.category;
    //console.log(category);
    try{
        const commentDetails = await commentsDb.find({category:category});
        res.status(200).json({commentsAndLikes:commentDetails})
    }
    catch(err){
        res.status(500).json({error :"internal error"});
        //next();
    }

});


module.exports = router;