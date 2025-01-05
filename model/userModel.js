const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        require: true
    },
    last_name: {
        type: String,
        require: true
    },
    phone_no: {
        type: String,
        require: true
    },
    phone_code: {
        type: String,
        require: true
    },
    otp: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    date_of_birth:
    {
        type: Date,
        required: true
    },
    otp_expiration: Date,
    is_verified:
    {
        type: Boolean,
        default: false
    },

},
    { timestamps: true }

)


module.exports = mongoose.model("User", userSchema);