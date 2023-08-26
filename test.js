require('dotenv').config();
let mongoose = require("mongoose");
const Schema = mongoose.Schema;

// connecting to mongo cluster
mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

// schema and model
let urlSchema = new Schema({ original_url: String, short_url: Number });
let urlModel = mongoose.model('URL', urlSchema);

function getCount() {
    urlModel.findOne({short_url:6}).then(data=>{
        console.log(data);
    })
}

getCount()
