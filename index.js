const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const session = require("express-session");
const userdatamodel = require("./models/userdataschema");
const vegetablesmodel = require("./models/vegetables");
const floursmodel = require("./models/flours");
const ricemodel = require("./models/rice");
const dalsmodel = require("./models/dals");
const cartmodel = require("./models/cart");
const coffeemodel = require("./models/coffees");
const spicesmodel = require("./models/spices");
const snacksmodel = require("./models/snacks");
const milkmodel = require("./models/milks");
const saucesmodel = require("./models/sauces");
const oilmodel = require("./models/oils");
const cleaningmodel = require("./models/cleaners");
const hygienemodel = require("./models/hygiene");
const toiletariesmodel = require("./models/toiletaries");
const disposablesmodel = require("./models/disposables");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
	session({
		secret: "ECOMMERCE_GROCERY",
		resave: false,
		saveUninitialized: true,
	})
);

mongoose
	.connect("mongodb://127.0.0.1:27017/grocery")
	.then(() => {
		console.log("MongoDB connected");
	})
	.catch((error) => {
		console.error("MongoDB connection error:", error);
	});

app.get("/", (req, res) => {
	res.render("home", { loginstatus: req.session.status, adminstatus: false });
});

app.get("/home", (req, res) => {
	res.render("home", { loginstatus: req.session.status, adminstatus: false });
});

app.get("/adminhome", (req, res) => {
	res.render("home", { loginstatus: req.session.status, adminstatus: true });
});

app.get("/signup", (req, res) => {
	res.render("signup", {
		emailexists: false,
		mobileexists: false,
		adminstatus: false,
	});
});

app.get("/login", (req, res) => {
	res.render("login", {
		loginerror: false,
		adminstatus: false,
		signupstatus: false,
	});
});

app.get("/adminlogin", (req, res) => {
	res.render("adminlogin", { loginerror: false, adminstatus: false });
});

app.post("/signup", async (req, res) => {
	const { name, email, mobile, address, password } = req.body;
	const checkemail = await userdatamodel.findOne({ email: email });
	const checkmobile = await userdatamodel.findOne({ mobile: mobile });

	if (checkemail) {
		return res.render("signup", {
			emailexists: true,
			mobileexists: false,
			adminstatus: false,
		});
	}

	if (checkmobile) {
		return res.render("signup", {
			emailexists: false,
			mobileexists: true,
			adminstatus: false,
		});
	}

	const hashedpwd = await bcryptjs.hash(password, 12);
	const newuser = new userdatamodel({
		name: name,
		email: email,
		mobile: mobile,
		address: address,
		password: hashedpwd,
	});
	await newuser.save();
	res.render("login", {
		signupstatus: true,
		loginerror: false,
		adminstatus: false,
	});
});

app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	const user = await userdatamodel.findOne({ email: email });

	if (!user) {
		return res.render("login", {
			signupstatus: false,
			loginerror: true,
			adminstatus: false,
		});
	}

	const isPasswordValid = await bcryptjs.compare(password, user.password);
	if (!isPasswordValid) {
		return res.render("login", {
			signupstatus: false,
			loginerror: true,
			adminstatus: false,
		});
	}
	req.session.email = email;
	req.session.status = true;
	return res.redirect("/");
});

app.post("/adminlogin", async (req, res) => {
	const { email, password } = req.body;
	if (email === "admin@gmail.com" && password === "123") {
		req.session.email = email;
		req.session.status = true;
		res.render("adminpage", { adminstatus: true, loginstatus: false,newitem : false,itemdeleted : false ,itemname : null});
	} else {
		res.render("adminlogin", { loginerror: true, adminstatus: false });
	}
});

app.get("/editprofile", async (req, res) => {
	let email = req.session.email;
	const userdetails = await userdatamodel.findOne({ email });
	res.render("editprofile", {
		loginstatus: req.session.status,
		adminstatus: false,
		userdetails: userdetails,
		emailexist: false,
		mobileexist: false,
	});
});

app.post("/updateprofile", async (req, res) => {
	const { newname, newmobile, newaddress } = req.body;
	let email = req.session.email;
	let existingUser = await userdatamodel.findOne({ email });
	let checkingmobile = await userdatamodel.findOne({ mobile: newmobile });

	if (existingUser) {
		existingUser.name = newname;
		existingUser.mobile = newmobile;
		existingUser.address = newaddress;
		await existingUser.save();
	}
	const userdetails = await userdatamodel.findOne({ email });

	res.render("editprofile", {
		loginstatus: req.session.status,
		adminstatus: false,
		userdetails: userdetails,
		mobileexist: false,
		updatedstatus: true,
	});
});

app.get("/vegetables", async (req, res) => {
	const email = req.session.email;
	const vegetables = await vegetablesmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'vegetables';
		res.render("vegetables", {vegetables: vegetables,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("vegetables", {vegetables: vegetables,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.post('/additem',async(req,res)=>{
	const {name,imageurl,price,quantity} = req.body;
	const itemname = req.session.itemtype;
	const modelname = itemname + 'model';
	if(modelname === 'vegetablesmodel'){
		const newitem = new vegetablesmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'floursmodel'){
		const newitem = new floursmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'ricemodel'){
		const newitem = new ricemodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'coffeemodel'){
		const newitem = new coffeemodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'cleaningmodel'){
		const newitem = new cleaningmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'oilmodel'){
		const newitem = new oilmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'hygienemodel'){
		const newitem = new hygienemodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'toiletariesmodel'){
		const newitem = new toiletariesmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'disposablesmodel'){
		const newitem = new disposablesmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}
	res.render("adminpage", { adminstatus: true, loginstatus: false ,newitem : true ,itemdeleted : false ,itemname : null});
});

app.get("/flours", async (req, res) => {
	const email = req.session.email;
	const flours = await floursmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'flours';
		res.render("flours", {flours: flours,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("flours", {flours: flours,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get('/dal-lentils-legumes',async(req,res)=>{
	const email = req.session.email;
	const dals = await dalsmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'dals';
		res.render("dals", {dals: dals,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("dals", {dals: dals,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get('/spices',async(req,res)=>{
	const email = req.session.email;
	const spices = await spicesmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'spices';
		res.render("spices", {spices: spices,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("spices", {spices: spices,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get('/milk-nondiary',async(req,res)=>{
	const email = req.session.email;
	const milk = await milkmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'milk';
		res.render("milk", {milk: milk,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("milk", {milk: milk,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get('/sauces-masala-paste',async(req,res)=>{
	const email = req.session.email;
	const sauces = await saucesmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'sauces';
		res.render("sauces", {sauces: sauces,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("sauces", {sauces: sauces,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/rice", async (req, res) => {
	const email = req.session.email;
	const rice = await ricemodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'rice';
		res.render("rice", {rice: rice,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("rice", {rice: rice,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get('/pasta-noodles-snack',async(req,res)=>{
	const email = req.session.email;
	const snacks = await snacksmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'snacks';
		res.render("snacks", {snacks: snacks,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("snacks", {snacks: snacks,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/coffee", async (req, res) => {
	const email = req.session.email;
	const coffee = await coffeemodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'vegetables';
		res.render("coffee", {coffee: coffee,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("coffee", {coffee: coffee,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/oil", async (req, res) => {
	const email = req.session.email;
	const oil = await oilmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'oil';
		res.render("oil", {oil: oil,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("oil", {oil: oil,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/cleaning-supplies", async (req, res) => {
	const email = req.session.email;
	const cleaners = await cleaningmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'vegetables';
		res.render("cleaners", {cleaners: cleaners,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("cleaners", {cleaners: cleaners,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/personalhygiene", async (req, res) => {
	const email = req.session.email;
	const hygienes = await hygienemodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'hygienes';
		res.render("hygienes", {hygienes: hygienes,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("hygienes", {hygienes: hygienes,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/toiletaries", async (req, res) => {
	const email = req.session.email;
	const toiletaries = await toiletariesmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'toiletaries';
		res.render("toiletaries", {toiletaries: toiletaries,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("toiletaries", {toiletaries: toiletaries,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/disposables", async (req, res) => {
	const email = req.session.email;
	const disposables = await disposablesmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'disposables';
		res.render("disposables", {disposables: disposables,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("disposables", {disposables: disposables,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});
app.get("/additem", (req, res) => {
	res.render("additem");
});
app.post("/add-to-cart", async (req, res) => {
	const { id, quantity, price, name } = req.body;
	const useremail = req.session.email;

	if (req.session.status) {
		try {
			await cartmodel.create({
				email: useremail,
				itemid: id,
				itemname: name,
				itemquantity: quantity,
				itemquantitylevel: 1,
				itemprice: price,
			});
			req.session.alertMessage = "Item added to cart";
		} catch (error) {
			console.error("Error adding item to cart:", error);
			res
				.status(500)
				.send("An error occurred while adding the item to the cart.");
			return;
		}
	} else {
		return res.render("login", {
			signupstatus: false,
			loginerror: false,
			adminstatus: false,
		});
	}
	const refererUrl = req.headers.referer;
	res.redirect(refererUrl);
});

app.get("/mycart", async (req, res) => {
	const useremail = req.session.email;
	const cartdata = await cartmodel.find({ email: useremail });
	res.render("mycart", {
		loginstatus: req.session.status,
		adminstatus: false,
		cartdata: cartdata,
	});
});

app.post('/checkout',async(req,res)=>{
	const {itemName,itemQuantity,itemQuantityLevel,itemPrice,itemTotal} = req.body;
	console.log(itemName,itemQuantity,itemQuantityLevel,itemPrice,itemTotal);
	const email = req.session.email;
	const cartdata = await cartmodel.find({email : email});
	// res.render("checkout",{data : cartdata});
})

app.post("/deleteitem", async (req, res) => {
	const { itemid } = req.body;
	const useremail = req.session.email;

	try {
		const result = await cartmodel.findOneAndDelete({
			_id: itemid,
			email: useremail,
		});
		res.redirect("/mycart");
	} catch (error) {
		console.error("Error deleting item:", error);
		return res.status(500).json({ error: "Internal server error." });
	}
});

app.post('/delete-item',async(req,res)=>{
	const {itemid,itemcategory} = req.body;
	const Model = mongoose.model(itemcategory);
	const itemData = await Model.findOne({_id : itemid});
	const email = req.session.email;
	if(email === 'admin@gmail.com'){
		const deletedItem = await Model.findByIdAndDelete(itemid);
		if (!deletedItem) {
			return res.status(404).json({ message: "Item not found" });
		}
		res.render("adminpage", { adminstatus: true, loginstatus: false ,newitem : false,itemdeleted : true , itemname : itemData.itemname});
	}
});

app.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error("Error destroying session:", err);
		}
		res.redirect("/");
	});
});
app.get("/quote", (req, res) => {
	res.render("quote.ejs");
});
app.listen(3000, () => {
	console.log("Server running at port 3000");
});
