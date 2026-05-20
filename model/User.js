const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    // password and salt are handled automatically by the plugin
});

// This plugin adds the .register(), .authenticate() methods to the User model
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
