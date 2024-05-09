const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
        // Further operations can be done here
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });
