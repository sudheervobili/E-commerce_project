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
	res.render("home", { loginstatus: req.session.status });
});

app.get("/home", (req, res) => {
	res.render("home", { loginstatus: req.session.status });
});

app.get("/signup", (req, res) => {
	res.render("signup", { emailexists: false, mobileexists: false });
});

app.get("/login", (req, res) => {
	res.render("login", { signupstatus: false, loginerror: false });
});

app.post("/signup", async (req, res) => {
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
	const newuser = new userdatamodel({
		name: name,
		email: email,
		mobile: mobile,
		address: address,
		password: hashedpwd,
	});
	await newuser.save();
	res.render("login", { signupstatus: true, loginerror: false });
});

app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	const user = await userdatamodel.findOne({ email: email });

	if (!user) {
		return res.render("login", { signupstatus: false, loginerror: true });
	}

	const isPasswordValid = await bcryptjs.compare(password, user.password);
	if (!isPasswordValid) {
		return res.render("login", { signupstatus: false, loginerror: true });
	}
	req.session.email = email;
	req.session.status = true;
	return res.redirect("/");
});

app.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error("Error destroying session:", err);
		}
		res.redirect("/");
	});
});

app.listen(3000, () => {
	console.log("Server running at port 3000");
});
