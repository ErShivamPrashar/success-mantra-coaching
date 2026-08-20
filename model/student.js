const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        studentName: {
            type: String,
            required: true,
            trim: true
        },

        fatherName: {
            type: String,
            required: true,
            trim: true
        },

        motherName: {
            type: String,
            required: true,
            trim: true
        },

        schoolCollege: {
            type: String,
            required: true,
            trim: true
        },

        className: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        wardNo: {
            type: String,
            trim: true
        },

        district: {
            type: String,
            required: true,
            trim: true
        },

        pin: {
            type: String,
            trim: true
        },

        dob: {
            type: Date
        },

        caste: {
            type: String
        },

        gender: {
            type: String
        },

        aadhaar: {
            type: String
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        guardianOccupation: {
            type: String,
            trim: true
        },

        nationality: {
            type: String,
            default: "Indian"
        },

        mobile: {
            type: String,
            required: true
        },

        admissionDate: {
            type: Date
        },

        studentPhoto: {
            type: String
        },

        // paymentAmount: {
        //     type: Number,
        //     required: true
        // },

        utrNumber: {
            type: String,
            required: true,
            trim: true
        },

        paymentScreenshot: {
            type: String
        },

        paymentMethod: {
            type: String,
            required: true
        },

        declaration: {
            type: String,
            required: true
        },

       paymentStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
}
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);