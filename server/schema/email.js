const mongoose = require("mongoose");

// Create a new email object
const emailSchema = new mongoose.Schema({
    emailId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    email: {
        type: Object,
        required: true,
    },
});

const email = mongoose.model("emails", emailSchema);

module.exports = email;