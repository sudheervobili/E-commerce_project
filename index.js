const express = require('express');
const bodyparser = require('body-parser');
const userdatamodel = require("./models/userdataschema");

const app = express();
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended : true}));

app.get('/',(req,res)=>{
    
});

app.get('/signup',(req,res)=>{
    res.render('signup');
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.post('/signup',(req,res)=>{

});

app.post('/login',(req,res)=>{

});

app.listen(3000,()=>{
    console.log("Server running at port 3000 ");
})