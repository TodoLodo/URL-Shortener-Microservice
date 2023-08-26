require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
let mongoose = require("mongoose");
const Schema = mongoose.Schema;
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// connecting to mongo cluster
mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

// schema and model
let urlSchema = new Schema({ original_url: String, short_url: Number });
let urlModel = mongoose.model('URL', urlSchema);

function getCount() {
  urlModel.count({}, (err, data) => {
    if (err) {
      console.log(err);
    }
    else {
      return data;
    }
  })
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

//
app.get("/api/shorturl/:short_url", async (req, res) => {
  const { short_url } = req.params;
  urlModel.findOne({ short_url: short_url }).then(data => {
    if (data == null) {
      res.json({ error: "No short URL found for the given input" });
    } else {
      res.redirect(data.original_url);
    }
  });
})

app.post("/api/shorturl", async (req, res) => {
  const { url } = req.body;
  const dnsLookup = dns.lookup(urlparser.parse(url).hostname, async (err, addr) => {
    if (!addr) {
      res.json({ error: 'invalid url' });
    }
    else {
      urlModel.findOne({ original_url: url }).then(data => {
        if (data == null) {
          urlModel.count({}).then(n => {
            new urlModel({ original_url: url, short_url: n + 1 }).save()
              .then(data => {
                res.json({ original_url: data.original_url, short_url: data.short_url });
              })
          });
        } else {
          res.json({ original_url: data.original_url, short_url: data.short_url });
        }
      });
    }
  });
  console.log(req.body);
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
