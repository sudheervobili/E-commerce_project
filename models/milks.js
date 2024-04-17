const mongoose = require("mongoose");

const milkschema = new mongoose.Schema({
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

const milk = mongoose.model("milk", milkschema);

module.exports = milk;
