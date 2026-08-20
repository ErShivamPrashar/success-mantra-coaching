const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const Student = require("../model/student");

const router = express.Router();


// =====================================
// UPLOAD DIRECTORY
// =====================================

const uploadDir = path.join(
    __dirname,
    "..",
    "public",
    "uploads"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}


// =====================================
// MULTER STORAGE
// =====================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, uploadDir);

    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});


// =====================================
// MULTER
// =====================================

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
                )
            );

        }

    }

});


// =====================================
// EMAIL TRANSPORTER
// =====================================

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS
    }
});


// =====================================
// REGISTRATION POST
// =====================================

router.post(

    "/",

    upload.fields([

        {
            name: "studentPhoto",
            maxCount: 1
        },

        {
            name: "paymentScreenshot",
            maxCount: 1
        }

    ]),

    async (req, res) => {

        try {

            // =================================
            // FORM DATA
            // =================================

            const {

                studentName,
                fatherName,
                motherName,
                schoolCollege,
                className,
                address,
                wardNo,
                district,
                pin,
                dob,
                caste,
                gender,
                aadhaar,
                email,
                guardianOccupation,
                nationality,
                mobile,
                admissionDate,

                // paymentAmount,
                utrNumber,
                paymentMethod,

                declaration

            } = req.body;


            // =================================
            // REQUIRED VALIDATION
            // =================================

            if (
                !studentName ||
                !fatherName ||
                !motherName ||
                !schoolCollege ||
                !className ||
                !address ||
                !district ||
                !dob ||
                !gender ||
                !mobile
            ) {

                return res.status(400).send(
                    "Please fill all required fields."
                );

            }


            if (
                // !paymentAmount ||
                !utrNumber ||
                !paymentMethod
            ) {

                return res.status(400).send(
                    "Please fill complete payment details."
                );

            }


            // =================================
            // FILES
            // =================================

            const studentPhoto =
                req.files?.studentPhoto?.[0];

            const paymentScreenshot =
                req.files?.paymentScreenshot?.[0];


            if (!paymentScreenshot) {

                return res.status(400).send(
                    "Payment screenshot is required."
                );

            }


            // =================================
            // FILE PATH
            // =================================

            const studentPhotoPath =
                studentPhoto
                    ? `/uploads/${studentPhoto.filename}`
                    : null;

            const paymentScreenshotPath =
                `/uploads/${paymentScreenshot.filename}`;


            // =================================
            // SAVE MONGODB
            // =================================

            const student = new Student({

                studentName,
                fatherName,
                motherName,
                schoolCollege,
                className,

                address,
                wardNo,
                district,
                pin,

                dob,
                caste,
                gender,
                aadhaar,

                email,

                guardianOccupation,
                nationality,
                mobile,

                admissionDate,

                studentPhoto:
                    studentPhotoPath,

                // paymentAmount,
                utrNumber,

                paymentScreenshot:
                    paymentScreenshotPath,

                paymentMethod,

                declaration,

                paymentStatus: "Pending"

            });


            await student.save();


            console.log(
                "Registration Saved:",
                student._id
            );


            // =================================
            // EMAIL ATTACHMENTS
            // =================================

            const attachments = [];


            if (studentPhoto) {

                attachments.push({

                    filename:
                        studentPhoto.originalname,

                    path:
                        studentPhoto.path

                });

            }


            if (paymentScreenshot) {

                attachments.push({

                    filename:
                        paymentScreenshot.originalname,

                    path:
                        paymentScreenshot.path

                });

            }


            // =================================
            // ADMIN EMAIL
            // =================================

            await transporter.sendMail({

                  from:
                      `"Success Mantra Coaching" <${process.env.ADMIN_EMAIL}>`,

                    to:
                       email,

                subject:
                    `New Admission - ${studentName}`,

                html: `

                    <div style="
                        font-family: Arial;
                        line-height: 1.7;
                    ">

                        <h2>
                            New Admission Registration
                        </h2>

                        <hr>

                        <h3>
                            Student Details
                        </h3>

                        <p>
                            <b>Name:</b>
                            ${studentName}
                        </p>

                        <p>
                            <b>Father:</b>
                            ${fatherName}
                        </p>

                        <p>
                            <b>Mother:</b>
                            ${motherName}
                        </p>

                        <p>
                            <b>School/College:</b>
                            ${schoolCollege}
                        </p>

                        <p>
                            <b>Class:</b>
                            ${className}
                        </p>

                        <p>
                            <b>Mobile:</b>
                            ${mobile}
                        </p>

                        <p>
                            <b>Email:</b>
                            ${email || "Not provided"}
                        </p>

                        <p>
                            <b>Address:</b>
                            ${address}
                        </p>

                        <p>
                            <b>District:</b>
                            ${district}
                        </p>

                        <p>
                            <b>Gender:</b>
                            ${gender}
                        </p>

                        <p>
                            <b>DOB:</b>
                            ${dob}
                        </p>

                        <hr>

                        <h3>
                            Payment Details
                        </h3>

                        

                        <p>
                            <b>UTR:</b>
                            ${utrNumber}
                        </p>

                        <p>
                            <b>Payment Method:</b>
                            ${paymentMethod}
                        </p>

                        <p>
                            <b>Payment Status:</b>
                            Pending Verification
                        </p>

                        <hr>

                        <p>
                            <b>Registration ID:</b>
                            ${student._id}
                        </p>

                    </div>

                `,

                attachments

            });


            // =================================
            // STUDENT EMAIL
            // =================================

            if (email) {

                await transporter.sendMail({
  from:
           `"Success Mantra Coaching" <${process.env.ADMIN_EMAIL}>`,

                    to:
                        email,

                    subject:
                        "Registration Received - Success Mantra Coaching",

                    html: `

                        <div style="
                            font-family: Arial;
                            line-height: 1.7;
                        ">

                            <h2>
                                Registration Successful
                            </h2>

                            <p>
                                Dear ${studentName},
                            </p>

                            <p>
                                आपका registration successfully
                                receive हो गया है।
                            </p>

                            <p>
                                <b>Registration ID:</b>
                                ${student._id}
                            </p>

                         
                            <p>
                                <b>UTR Number:</b>
                                ${utrNumber}
                            </p>

                            <p>
                                आपका payment अभी
                                <b>verification में है.</b>
                            </p>

                            <p>
                                Payment verification के बाद
                                आपको आगे की जानकारी दी जाएगी।
                            </p>

                            <br>

                            <p>
                                धन्यवाद,<br>

                                <b>
                                    Success Mantra Coaching
                                </b>
                            </p>

                        </div>

                    `

                });

            }


            // =================================
            // SUCCESS RESPONSE
            // =================================

            res.send(`

                <!DOCTYPE html>

                <html>

                <head>

                    <title>
                        Registration Successful
                    </title>

                    <style>

                        body {
                            font-family: Arial;
                            background: #f5f7fa;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            margin: 0;
                        }

                        .success-box {
                            background: white;
                            padding: 40px;
                            max-width: 500px;
                            width: 90%;
                            text-align: center;
                            border-radius: 15px;
                            box-shadow:
                                0 10px 30px
                                rgba(0,0,0,.1);
                        }

                        h1 {
                            color: #198754;
                        }

                        a {
                            display: inline-block;
                            margin-top: 20px;
                            text-decoration: none;
                            padding: 12px 20px;
                            background: #198754;
                            color: white;
                            border-radius: 8px;
                        }

                    </style>

                </head>

                <body>

                    <div class="success-box">

                        <h1>
                            Registration Successful
                        </h1>

                        <p>
                            आपका registration successfully
                            submit हो गया है।
                        </p>

                        <p>
                            <b>
                                Registration ID:
                            </b>
                            <br>
                            ${student._id}
                        </p>

                        <p>
                            आपका payment verification के लिए
                            भेज दिया गया है।
                        </p>

                        <a href="/">
                            Back to Home
                        </a>

                    </div>

                </body>

                </html>

            `);


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );

            res.status(500).send(
                "Registration failed. Please try again."
            );

        }

    }

);


module.exports = router;