const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require("path");
const cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
const passport = require('passport');

router.use(cookieParser());

const navLinksDb = require('../models/navLinksModel');
const socialDb = require('../models/socialIconsModel');
const authentication = require('./login');


const storage = multer.diskStorage({
    destination: "./public/images/",
    filename: function(req, file, cb){
        cb(null,req.params.category +req.params.article + ".jpg");
    }
});

const upload = multer({
    storage: storage,
}).single("myImage");

router.post("/upload/:category/:article", (req,res)=> {
    if(Object.keys(req.cookies).length === 0){
         res.json({success:false,message:"Login to perform this action"})
    }
    else{
        upload (req,res, (err) => {
            console.log("Request ---", req.body);
            console.log("Request file ---", req.file);//Here you get file.
            /*Now do where ever you want to do*/
            if(!err)
                res.status(200).json({"image":true});
            else{
                res.send("error");
            }
        })
    }

});


router.put('/',  async (req,res,next) =>{
    //console.log("cookies",Object.keys(req.cookies).length === 0);
    //console.log(req.session);
    //console.log(req.cookies);
    //console.log("session",req.session.passport);
    const cat = req.params.category;
    if(Object.keys(req.cookies).length === 0){
        await res.json({success:false,message:"Login to perform this action"})
    }
    else{
        try{
            const navInfo = req.body;
            navInfo["uploadedOn"] =new Date().toISOString();
            //navInfo["category"] = cat;
            const nav =  await navLinksDb.update({"category": navInfo.category},navInfo, {returnUpdatedDocs: true, upsert: true});
            res.status(200).json({success:true,nav:nav, "message":"success"});

        }
        catch(err){
            res.status(500).json({ error: "internal error" });
            next(err);
        }
    }

});

router.get('/',async (req,res,next) =>{
    try{
        const nav = await navLinksDb.find({});
        res.status(200).json(nav)
    }
     catch(err){
         res.status(500).json({ error: "internal error" });
         next(err);
    }

});

router.get('/articles/:category',async (req,res,next) =>{
    try{
        const nav = await navLinksDb.findOne({category:req.params.category});
        res.status(200).json(nav.items)
    }
    catch(err){
        res.status(500).json({ error: "internal error" });
        next(err);
    }

});

router.delete('/:category',async (req,res,next)=>{
    if(Object.keys(req.cookies).length === 0){
        await res.json({success:false,message:"Login to perform this action"})
    }
    else{
        const cat = req.params.category;
        try{
            const num = await navLinksDb.remove({category:cat},{})
            if(num > 0){
                res.status(200).json({success:true, message:"Deleted"})
            }
            else{
                res.status(404).json({message:"Not found"})
            }
        }
        catch(err){
            res.status(500).json({ error: "internal error" });
            next(err);
        }
    }

});

router.put('/aboutMe',  async (req,res,next) =>{
    const cat = req.params.category;
    if(Object.keys(req.cookies).length === 0){
        await res.json({success:false,message:"Login to perform this action"})
    }
    else{
        try{
            const aboutMe = req.body;
            aboutMe["uploadedOn"] =new Date().toISOString();
            //navInfo["category"] = cat;
            const about =  await navLinksDb.update({category: "home"},aboutMe, {returnUpdatedDocs: true, upsert: true});
            res.status(200).json({success:true, about:about});

        }
        catch(err){
            res.status(500).json({ error: "internal error" });
            next(err);
        }
    }

});

router.get('/aboutMe',  async (req,res,next) =>{
    //const cat = req.params.category;
    try{
        //navInfo["category"] = cat;
        const home =  await navLinksDb.findOne({category: "home"});
        res.status(200).json(home.aboutMe);

    }
    catch(err){
        res.status(500).json({ error: "internal error" });
        next(err);
    }
});

router.get('/social',  async (req,res,next) =>{
    //const cat = req.params.category;
    try{
        //navInfo["category"] = cat;
        const social =  await socialDb.findOne({googleId: "105828116220993776046"});
        //console.log(social);
        res.status(200).json({icons:social.icons});

    }
    catch(err){
        res.status(500).json({ error: "internal error" });
        next(err);
    }
});

router.put('/social',async (req,res,next)=>{
    if(Object.keys(req.cookies).length === 0){
        await res.json({success:false,message:"Login to perform this action"})
    }
    else{
        try{
            const socialIcons = req.body;
            const user = req.cookies.user;
            //navInfo["category"] = cat;
            const socialInfo =  await socialDb.update({googleId:user.googleId},socialIcons,
                {returnUpdatedDocs: true, upsert: true});
            res.status(200).json({success:true, social:socialInfo});

        }
        catch(err){
            res.status(500).json({ error: "internal error" });
            next(err);
        }
    }
});





module.exports = router;