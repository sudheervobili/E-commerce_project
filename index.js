const express = require('express');
const bodyparser = require('body-parser');

const app = express();
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended : true}));

app.post('/signup',(req,res)=>{

});

app.post('/login',(req,res)=>{
    
});

app.listen(3000,()=>{
    console.log("Server running at port 3000 ");
})