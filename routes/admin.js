const express = require("express");

const  Resend  = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const Student = require("../model/student");
const FeePayment = require("../model/fee");
const student = require("../model/student");

const router = express.Router();


// ==========================================
// EMAIL SETUP
// ==========================================



// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get("/admin-smc-shivexa", async (req, res) => {

    try {

        const students =
            await Student.find()
                .sort({
                    createdAt: -1
                });


        const payments =
            await FeePayment.find()
                .sort({
                    createdAt: -1
                });


        res.render(
            "admin.ejs",
            {
                students,
                payments
            }
        );


    } catch (error) {

        console.error(
            "Admin Dashboard Error:",
            error
        );

        res.status(500).send(
            "Admin panel load नहीं हो पाया।"
        );

    }

});


// ==========================================
// APPROVE REGISTRATION
// ==========================================

// ==========================================
// APPROVE REGISTRATION
// ==========================================
router.post(
    "/admin/registration/:id/approve",
    async (req, res) => {

        try {

            console.log("Approve ID:", req.params.id);

            const student = await Student.findOneAndUpdate(
                {
                    _id: req.params.id
                },
                {
                    $set: {
                         paymentStatus: "Approved"
                    }
                },
                {
                    returnDocument: "after"
                }
            );

            if (!student) {
                console.log("Student NOT FOUND");

                return res.status(404).send(
                    "Student नहीं मिला।"
                );
            }

            console.log(
                "Updated Student:",
                student._id
            );

            console.log(
                "New Status:",
                student.paymentStatus
            );


            // Database se dobara check
            const checkStudent = await Student.findById(
                req.params.id
            );

            console.log(
                "Database Status:",
                checkStudent.paymentStatus
            );


            // Email
            if (student.email) {

                await resend.emails.send({

                    from: "Success Mantra Coaching <onboarding@resend.dev>",

                    to: student.email,

                    subject:
                        "Registration Approved - Success Mantra Coaching",

                    html: `

                        <h2>Registration Approved</h2>

                        <p>
                            Dear
                            <strong>
                                ${student.studentName}
                            </strong>,
                        </p>

                        <p>
                            आपकी registration successfully
                            approved हो गई है।
                        </p>

                        <p>
                            <strong>Class:</strong>
                            ${student.className}
                        </p>

                        <p>
                            अब आप coaching की classes
                            attend कर सकते हैं।
                        </p>

                        <br>

                        <p>
                            Regards,<br>
                            Success Mantra Coaching
                        </p>

                    `

                });

            }


            res.redirect("/admin-smc-shivexa");


        } catch (error) {

            console.error(
                "APPROVE ERROR:",
                error
            );

            res.status(500).send(
                "Registration approve नहीं हो पाया।"
            );
        }
    }
);

// ==========================================
// REJECT REGISTRATION
// ==========================================

router.post(
    "/admin/registration/:id/reject",
    async (req, res) => {

        try {

            const student = await Student.findByIdAndUpdate(
                req.params.id,

                {
                    $set: {
                        paymentStatus: "Rejected"
                    }
                },

                {
                    returnDocument: "after"
                }
            );


            if (!student) {

                return res.status(404).send(
                    "Student नहीं मिला।"
                );

            }


            console.log(
                "Registration Rejected:",
                student._id
            );


            // Student ko rejection email
            if (student.email) {

                await resend.emails.send({

                    from:  "Success Mantra Coaching <onboarding@resend.dev>",

                    to:student.email,

                    subject:
                        "Registration Status - Success Mantra Coaching",

                    html: `

                        <h2>Registration Status</h2>

                        <p>
                            Dear
                            <strong>
                                ${student.studentName}
                            </strong>,
                        </p>

                        <p>
                            आपकी registration अभी
                            approve नहीं की गई है।
                        </p>

                        <p>
                            अधिक जानकारी के लिए
                            Success Mantra Coaching
                            से संपर्क करें।
                        </p>

                        <br>

                        <p>
                            Regards,<br>
                            <strong>
                                Success Mantra Coaching
                            </strong>
                        </p>

                    `

                });

            }


            res.redirect("/admin-smc-shivexa");


        } catch (error) {

            console.error(
                "Reject Error:",
                error
            );

            res.status(500).send(
                "Registration reject नहीं हो पाया।"
            );

        }

    }
);

// ==========================================
// APPROVE FEE PAYMENT
// ==========================================

router.post(
    "/admin/payment/:id/approve",
    async (req, res) => {

        try {

            const payment =
                await FeePayment.findByIdAndUpdate(

                    req.params.id,

                    {
                        paymentStatus:
                            "Approved"
                    },

                    {
                        new: true
                    }

                );


            if (!payment) {

                return res.status(404).send(
                    "Payment नहीं मिला।"
                );

            }


            // Student की email निकालना

            const student =
                await Student.findOne({

                    registrationNumber:
                        payment._id

                });


            if (
                student &&
                student.email
            ) {

                await resend.emails.send({

                    from:
                   "Success Mantra Coaching <onboarding@resend.dev>",

                    to:
                     student.email,

                    subject:
                        "Fee Payment Confirmed - Success Mantra Coaching",

                    html: `

                        <h2>
                            Payment Confirmed ✅
                        </h2>

                        <p>
                            Dear
                            <strong>
                                ${payment.studentName}
                            </strong>,
                        </p>

                        <p>
                            आपकी monthly fee payment
                            successfully verify और
                            confirm कर दी गई है।
                        </p>

                        <hr>

                        <p>
                            <strong>
                                Registration Number:
                            </strong>
                            ${payment._id}
                        </p>

                        <p>
                            <strong>
                                Month:
                            </strong>
                            ${payment.feeMonth}
                        </p>

                        <p>
                            <strong>
                                Amount:
                            </strong>
                            ₹${payment.expectedAmount}
                        </p>

                        <p>
                            <strong>
                                UTR:
                            </strong>
                            ${payment.utrNumber}
                        </p>

                        <hr>

                        <p>
                            Payment Status:
                            <strong>
                                Approved
                            </strong>
                        </p>

                        <br>

                        <p>
                            Regards,<br>
                            Success Mantra Coaching
                        </p>

                    `

                });

            }


            res.redirect("/admin-smc-shivexa");

        } catch (error) {

            console.error(error);

            res.status(500).send(
                "Payment approve नहीं हो पाया।"
            );

        }

    }
);


// ==========================================
// REJECT FEE PAYMENT
// ==========================================

router.post(
    "/admin/payment/:id/reject",
    async (req, res) => {

        try {

            const payment =
                await FeePayment.findByIdAndUpdate(

                    req.params.id,

                    {
                        paymentStatus:
                            "Rejected"
                    },

                    {
                        new: true
                    }

                );


            if (!payment) {

                return res.status(404).send(
                    "Payment नहीं मिला।"
                );

            }


            const student =
                await Student.findOne({

                    registrationNumber:
                        payment._id

                });


            if (
                student &&
                student.email
            ) {

                await resend.emails.send({

                    from:
                        "Success Mantra Coaching <onboarding@resend.dev>",

                    to:
                        student.email,

                    subject:
                        "Fee Payment Rejected - Success Mantra Coaching",

                    html: `

                        <h2>
                            Payment Rejected ❌
                        </h2>

                        <p>
                            Dear
                            <strong>
                                ${payment.studentName}
                            </strong>,
                        </p>

                        <p>
                            आपकी monthly fee payment
                            verify नहीं हो पाई।
                        </p>

                        <p>
                            कृपया UTR और payment screenshot
                            check करके दोबारा payment details
                            submit करें।
                        </p>

                        <p>
                            <strong>
                                Month:
                            </strong>
                            ${payment.feeMonth}
                        </p>

                        <p>
                            <strong>
                                UTR:
                            </strong>
                            ${payment.utrNumber}
                        </p>

                        <br>

                        <p>
                            Regards,<br>
                            Success Mantra Coaching
                        </p>

                    `

                });

            }


            res.redirect("/admin-smc-shivexa");

        } catch (error) {

            console.error(error);

            res.status(500).send(
                "Payment reject नहीं हो पाया।"
            );

        }

    }
);


module.exports = router;