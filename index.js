const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyparser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.send("Hello world");
});

app.get("/signup", (req, res) => {
	res.render("signup.ejs");
});

app.post("/login", (req, res) => {});

app.listen(3000, () => {
	console.log("Server running at port 3000 ");
});
