const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// const nodemailer = require("nodemailer");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FeePayment = require("../model/fee");
const Student = require("../model/student");

const router = express.Router();


// =====================================================
// FIXED MONTHLY FEE
// =====================================================

const MONTHLY_FEE = 700;


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(
    __dirname,
    "..",
    "public",
    "uploads",
    "fee-payments"
);


if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, {
        recursive: true
    });

}


// =====================================================
// MULTER
// =====================================================

const storage = multer.diskStorage({

    destination: function(req, file, cb) {

        cb(null, uploadDir);

    },


    filename: function(req, file, cb) {

        const fileName =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1000000000
            ) +
            path.extname(
                file.originalname
            );

        cb(null, fileName);

    }

});


const upload = multer({

    storage: storage,

    limits: {

        fileSize:
            5 * 1024 * 1024

    },

    fileFilter: function(req, file, cb) {

        const allowedTypes = [

            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"

        ];


        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only image files are allowed."
                )
            );

        }

    }

});


// =====================================================
// EMAIL
// =====================================================

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS
    }
});


// =====================================================
// GET MONTHLY PAGE
// =====================================================




// =====================================================
// POST PAYMENT
// =====================================================

router.post(
    "/payment",
    upload.single("paymentScreenshot"),

    async (req, res) => {

        try {

            const {

                studentName,
                registrationNumber,
                className,
                email,
                feeMonth,
                utrNumber,
                paymentMethod

            } = req.body;


            // =============================================
            // REQUIRED DATA
            // =============================================

            if (
                !studentName ||
                !registrationNumber ||
                !className ||
                !email ||
                !feeMonth ||
                !utrNumber ||
                !paymentMethod
            ) {

                return res.status(400).send(`

                    <h2>
                        Payment अमान्य
                    </h2>

                    <p>
                        सभी details भरना जरूरी है।
                    </p>

                    <a href="/monthly">
                        वापस जाएं
                    </a>

                `);

            }


            // =============================================
            // SCREENSHOT
            // =============================================

            if (!req.file) {

                return res.status(400).send(`

                    <h2>
                        Payment अमान्य
                    </h2>

                    <p>
                        Payment screenshot upload करें।
                    </p>

                    <a href="/monthly">
                        वापस जाएं
                    </a>

                `);

            }


            // =============================================
            // STUDENT FIND
            // =============================================

            const student =
                await Student.findOne({

                   email:email

                });


            if (!student) {

                fs.unlinkSync(
                    req.file.path
                );


                return res.status(404).send(`

                    <h2>
                        Student नहीं मिला
                    </h2>

                    <p>
                        Registration Number गलत है।
                    </p>

                    <a href="/monthly">
                        वापस जाएं
                    </a>

                `);

            }


            // =============================================
            // SECURITY CALCULATION
            // =============================================

            /*
                Frontend की calculation पर भरोसा नहीं करेंगे।

                Backend खुद calculation करेगा।
            */

            const monthlyFee =
                Number(
                    student.monthlyFee ||
                    MONTHLY_FEE
                );


            const today =
                new Date();


            const currentDay =
                today.getDate();


            const lateFine =
                currentDay > 10
                    ? 100
                    : 0;


            const expectedAmount =
                monthlyFee +
                lateFine;


            // =============================================
            // SAVE PAYMENT
            // =============================================

         const payment = new FeePayment({

    studentName:
        student.studentName,

    email:
        student.email,

    registrationNumber:
        student._id.toString(),

    className:
        student.className,

    mobile:
        student.mobile,

    feeMonth,

    monthlyFee,

    lateFine,

    expectedAmount,

    receivedAmount:
        expectedAmount,

    utrNumber,

    paymentMethod,

    paymentScreenshot:
        "/uploads/fee-payments/" +
        req.file.filename,

    paymentStatus:
        "Pending"

});


await payment.save();


            // =============================================
            // ADMIN EMAIL
            // =============================================

            await resend.emails.send({

                 from:
                       "Success Mantra Coaching <onboarding@resend.dev>",

                    to:
                       email,

                subject:
                    "New Monthly Fee Payment - " +
                    student.studentName,

                html: `

                    <h2>
                        New Fee Payment
                    </h2>

                    <hr>

                    <p>
                        <b>Student:</b>
                        ${student.studentName}
                    </p>

                    <p>
                        <b>Registration No:</b>
                        ${student._id}
                    </p>

                    <p>
                        <b>Class:</b>
                        ${student.className}
                    </p>

                    <p>
                        <b>Email:</b>
                        ${student.email}
                    </p>

                    <p>
                        <b>Month:</b>
                        ${feeMonth}
                    </p>

                    <hr>

                    <p>
                        <b>Monthly Fee:</b>
                        ₹${monthlyFee}
                    </p>

                    <p>
                        <b>Late Fine:</b>
                        ₹${lateFine}
                    </p>

                    <p>
                        <b>Total Payable:</b>
                        ₹${expectedAmount}
                    </p>

                    <p>
                        <b>UTR:</b>
                        ${utrNumber}
                    </p>

                    <p>
                        <b>Payment Method:</b>
                        ${paymentMethod}
                    </p>

                    <p>
                        <b>Status:</b>
                        Pending Verification
                    </p>

                    <hr>

                    <p>
                        <b>Payment ID:</b>
                        ${payment._id}
                    </p>

                `,

                attachments: [

                    {
                        filename:
                            req.file.originalname,

                        path:
                            req.file.path
                    }

                ]

            });


            // =============================================
            // SUCCESS
            // =============================================

            res.send(`

                <!DOCTYPE html>

                <html>

                <head>

                    <title>
                        Payment Submitted
                    </title>

                </head>


                <body style="
                    font-family:Arial;
                    background:#f5f7fb;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    min-height:100vh;
                ">


                    <div style="
                        background:white;
                        padding:40px;
                        border-radius:15px;
                        text-align:center;
                        max-width:500px;
                        width:90%;
                        box-shadow:
                        0 10px 30px
                        rgba(0,0,0,.1);
                    ">

                        <h1>
                            Payment Submitted
                        </h1>


                        <p>
                            आपका fee payment
                            successfully submit हो गया है।
                        </p>


                        <p>
                            UTR और screenshot verification
                            के बाद payment approve किया जाएगा।
                        </p>


                        <p>
                            <strong>
                                Payment ID
                            </strong>

                            <br>

                            ${payment._id}

                        </p>


                        <br>


                        <a
                            href="/monthly"
                            style="
                                background:#111;
                                color:white;
                                padding:12px 20px;
                                text-decoration:none;
                                border-radius:8px;
                            "
                        >
                            Back to Fee Page
                        </a>

                    </div>

                </body>

                </html>

            `);


        } catch (error) {

            console.error(
                "Fee Payment Error:",
                error
            );


            if (req.file) {

                try {

                    fs.unlinkSync(
                        req.file.path
                    );

                } catch (e) {}

            }


            res.status(500).send(`

                <h2>
                    Something went wrong
                </h2>

                <p>
                    Please try again later.
                </p>

                <a href="/monthly">
                    Back
                </a>

            `);

        }

    }
);


module.exports = router;