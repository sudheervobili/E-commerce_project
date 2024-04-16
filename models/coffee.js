const mongoose = require("mongoose");

const coffeeSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	quantity: {
		type: String,
		required: true,
	},
	imageUrl: {
		type: String,
		required: true,
	},
});
const coffee = mongoose.model("coffee", coffeeSchema);

module.exports = coffee;
