const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const userdatamodel = require("./models/userdataschema");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/grocery')
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

app.get('/', (req, res) => {
    res.render("navbar");
});

app.get('/signup', (req, res) => {
    res.render('signup', { emailexists: false, mobileexists: false });
});

app.get('/login', (req, res) => {
    res.render('login', { signupstatus: false ,loginerror : false});
});

app.post('/signup', async (req, res) => {
    const { name, email, mobile, address, password } = req.body;
    const checkemail = await userdatamodel.findOne({ email: email });
    const checkmobile = await userdatamodel.findOne({ mobile: mobile });

    if (checkemail) {
        return res.render("signup", { emailexists: true, mobileexists: false });
    }

    if (checkmobile) {
        return res.render("signup", { emailexists: false, mobileexists: true });
    }

    const hashedpwd = await bcryptjs.hash(password, 12);
    const newuser = new userdatamodel({ name: name, email: email, mobile: mobile, address: address, password: hashedpwd });
    await newuser.save();
    res.render("login", { signupstatus: true , loginerror : false });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await userdatamodel.findOne({ email: email });

    if (!user) {
        return res.render('login', { signupstatus: false, loginerror: true }); 
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
        return res.render('login', { signupstatus: false, loginerror: true }); 
    }
    res.send('login succesfull !');
});

app.listen(3000, () => {
    console.log("Server running at port 3000");
});
