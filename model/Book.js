const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    Book_id: Number,
    Book_name: String,
    Author_name: String,
    Price: String,
    Age_group: String,
    Book_type: String,
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;