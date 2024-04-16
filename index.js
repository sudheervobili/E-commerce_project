const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const session = require("express-session");
const userdatamodel = require("./models/userdataschema");
const vegetablesmodel = require("./models/vegetables");
const floursmodel = require("./models/flours");
const ricemodel = require("./models/rice");
const cartmodel = require("./models/cart");
const coffeemodel = require("./models/coffees");

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
		res.render("adminpage", { adminstatus: true, loginstatus: false });
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
	const vegetables = await vegetablesmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	res.render("vegetables", {
		vegetables: vegetables,
		loginstatus: req.session.status,
		adminstatus: false,
		alertMessage: alertMessage,
	});
});

app.get("/flours", async (req, res) => {
	const flours = await floursmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	res.render("flours", {
		flours: flours,
		loginstatus: req.session.status,
		adminstatus: false,
		alertMessage: alertMessage,
	});
});

app.get("/rice", async (req, res) => {
	const rice = await ricemodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	res.render("rice", {
		rice: rice,
		loginstatus: req.session.status,
		adminstatus: false,
		alertMessage: alertMessage,
	});
});

app.get('/coffee',async(req,res)=>{
	const coffee = await coffeemodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	res.render("coffee", {
		coffee: coffee,
		loginstatus: req.session.status,
		adminstatus: false,
		alertMessage: alertMessage,
	});
})

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
