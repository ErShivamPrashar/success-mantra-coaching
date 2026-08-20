require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const registrationRouter =
    require("./routes/registration");

    const adminRouter = require("./routes/admin");

const feeRouter =
    require("./routes/fee");


const app = express();


// ======================================
// VIEW ENGINE
// ======================================

app.set(
    "view engine",
    "ejs"
);


// ======================================
// MIDDLEWARE
// ======================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.json()
);


// ======================================
// STATIC
// ======================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// ======================================
// MONGODB
// ======================================

mongoose
    .connect(
        process.env.MONGO_URI
    )
    .then(() => {

        console.log(
            "MongoDB Connected Successfully"
        );

    })
    .catch((error) => {

        console.error(
            "MongoDB Connection Error:",
            error
        );

    });


// ======================================
// HOME
// ======================================

app.get("/", (req, res) => {

    res.render("index");

});


app.get("/monthly", (req, res) => {

    res.render("monthly");

});


// ======================================
// REGISTRATION ROUTER
// ======================================

app.use(
    "/registration",
    registrationRouter
);


// ======================================
// FEE ROUTER
// ======================================

app.use(
    "/fee",
    feeRouter
);

app.use(
    "/",
    adminRouter
);

// ======================================
// SERVER
// ======================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);