const mongoose = require('mongoose');

module.exports  = async function connectDB()
 {
    
        try {
            await mongoose.connect('mongodb+srv://devakshay2107:62YhdkBb4z8VkyPv@realtimeauctionsystem.1u0ic.mongodb.net/UserOtp?retryWrites=true&w=majority')
            console.log('Db Connected Successfully')
        }
        catch (err) {
            console.log(err, 'error')
        }
    
    
}