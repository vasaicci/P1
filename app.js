const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./model/User");
const Book = require("./model/Book");

const app = express();

// --- Database Connection ---
// NOTE: I replaced '@' with '%40' in your password to fix connection errors.
mongoose.connect(
    `mongodb+srv://vasaicci:Aptech%40123@cluster0.5p2cyrc.mongodb.net/?appName=Cluster0`
)
.then(() => console.log("MongoDB Connected Successfully"))
.catch(err => console.log("MongoDB Connection Error:", err));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    require("express-session")({
        secret: "Rio is a dog",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + "/public"));

// --- Passport Configuration ---

// 1. Strategy for Registered Users (Database)
passport.use(new LocalStrategy(User.authenticate()));

// 2. Strategy for Admin (Hardcoded)
passport.use(
    "admin-local",
    new LocalStrategy(function (username, password, done) {
        if (username === "Admin" && password === "12345") {
            return done(null, { username: "Aptech", role: "admin" });
        }
        return done(null, false, { message: "Incorrect admin username or password" });
    })
);

// Serialize and Deserialize (Handles both User objects and Admin objects)
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// --- Routes ---

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/register", function (req, res) {
    res.render("register");
});

// User Register (Fixed: Hashes password automatically)
app.post("/register", function (req, res) {
    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        function (err, user) {
            if (err) {
                console.log(err);
                return res.render("register", { error: err.message });
            }
            // Log the user in immediately after registering
            passport.authenticate("local")(req, res, function () {
                res.redirect("/booklist");
            });
        }
    );
});

app.get("/login", function (req, res) {
    res.render("login");
});

// User Login (Fixed: Uses Passport authentication)
app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: false
}), async function (req, res) {
    try {
        const books = await Book.find({});
        res.render("booklist", { books: books });
    } catch (error) {
        res.render("error", { errorMessage: "Error fetching books" });
    }
});

// Booklist (Protected)
app.get("/booklist", isLoggedIn, async (req, res) => {
    try {
        const books = await Book.find({});
        res.render("booklist", { books: books });
    } catch (error) {
        res.render("error", { errorMessage: "Error fetching books" });
    }
});

// Admin Routes
app.get("/admin", function (req, res) {
    res.render("admin-login");
});

app.post(
    "/admin-login",
    passport.authenticate("admin-local", {
        successRedirect: "/admin-dashboard",
        failureRedirect: "/admin-error",
    })
);

app.get("/admin-error", function (req, res) {
    res.render("admin-error", { errorMessage: "Incorrect admin username or password" });
});

app.get("/admin-dashboard", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("admin-dashboard");
    } else {
        res.redirect("/admin");
    }
});

app.post("/admin-dashboard/add-book", function (req, res) {
    if (req.isAuthenticated()) {
        const bookDetails = {
            Book_id: req.body.Book_id,
            Book_name: req.body.Book_name,
            Author_name: req.body.Author_name,
            Price: req.body.Price,
            Age_group: req.body.Age_group,
            Book_type: req.body.Book_type,
        };

        Book.create(bookDetails)
            .then((newBook) => {
                console.log("Book added successfully:", newBook);
                res.redirect("/admin-dashboard");
            })
            .catch((err) => {
                console.error("Failed to add the book:", err);
                res.status(500).json({ error: "Failed to add the book" });
            });
    } else {
        res.redirect("/admin");
    }
});

app.get("/logout", function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect("/");
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server Has Started!");
});
