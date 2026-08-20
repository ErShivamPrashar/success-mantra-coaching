const mongoose = require("mongoose");


const feePaymentSchema =
    new mongoose.Schema({

        studentName: {
            type: String,
            required: true
        },


        registrationNumber: {
            type: String,
            required: true
        },


        className: {
            type: String,
            required: true
        },


        email: {
            type: String,
            required: true
        },


        feeMonth: {
            type: String,
            required: true
        },


        monthlyFee: {
            type: Number,
            required: true
        },


        lateFine: {
            type: Number,
            required: true
        },


        expectedAmount: {
            type: Number,
            required: true
        },


        receivedAmount: {
            type: Number,
            required: true
        },


        utrNumber: {
            type: String,
            required: true
        },


        paymentMethod: {
            type: String,
            required: true
        },


        paymentScreenshot: {
            type: String,
            required: true
        },


        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected"
            ],
            default: "Pending"
        },


        paymentDate: {
            type: Date,
            default: Date.now
        }

    }, {
        timestamps: true
    });


module.exports =
    mongoose.model(
        "FeePayment",
        feePaymentSchema
    );