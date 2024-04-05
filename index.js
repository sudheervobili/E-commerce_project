const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const userdatamodel = require("./models/userdataschema");

const app = express();
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended : true}));

mongoose.connect('mongodb://localhost:27017/grocery')
    .then(()=>{
        console.log("mongodb connected");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

app.get('/',(req,res)=>{
    
});

app.get('/signup',(req,res)=>{
    res.render('signup',{emailexists : false,mobileexists : false});
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.post('/signup',async(req,res)=>{
    const {name,email,mobile,address,password} = req.body;
    let checkemail = await userdatamodel.findOne({email : email});
    if(checkemail){
        res.render("signup",{emailexists : true,mobileexists : false});
    }
    if(checkmobile){
        res.render("signup",{emailexists : false,mobileexists : true});
    }
    const newuser = new userdatamodel({name : name,email : email,mobile : mobile,address : address,password : password});
    await newuser.save();
});

app.post('/login',(req,res)=>{

});

app.listen(3000,()=>{
    console.log("Server running at port 3000 ");
});