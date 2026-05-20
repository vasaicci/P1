const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
    Book_id: String,
    Book_name: String,
    Author_name: String,
    Price: Number,
    Age_group: String,
    Book_type: String
});

module.exports = mongoose.model("Book", BookSchema);
