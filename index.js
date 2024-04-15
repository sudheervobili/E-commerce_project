const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const session = require("express-session");
const userdatamodel = require("./models/userdataschema");

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
		res.render("adminpage", {
			adminstatus: true,
			loginstatus: false,
			adminstatus: true,
		});
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
