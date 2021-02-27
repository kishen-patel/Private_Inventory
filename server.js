//================================================================================
// #region Server Variables
//================================================================================

const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const https = require("https");
const fs = require("fs");
const bodyParser = require("body-parser");
const uri =
  "mongodb+srv://314IT:Final314IT@cluster0.jd8k7.mongodb.net/Private_Inventory?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  //   useUnifiedTopology: true,
});
const app = express();
const port = 3000;

app.use(
  bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: "50mb",
    extended: true,
  })
);

app.use(express.static(__dirname + "/client"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// MongoClient.connect(
//   db.url,
//   {
//     useNewUrlParser: true,
//   },
//   function (err, client) {
//     var rekDB = client.db("rek_api");
//     if (err) throw err;
//     require("./app/routes")(app, rekDB);
//     https.createServer(options, app).listen(port, () => {
//       console.log("We are live on " + port);
//     });
//     // app.listen(port, () => {
//     //     console.log('We are live on ' + port);
//     // });
//   }
// );

client.connect((err) => {
  const collection = client.db("314IT").collection("Stock");
  //   const stock = {
  //     product_ID: 123,
  //   };
  //   collection.insertOne(stock, (err, result) => {
  //     if (err) return console.error(err);
  //     console.info(result);
  //   });
  app.listen(port, () => {
    console.log("We are live on " + port);
  });
  // perform actions on the collection object
  client.close();
});

//================================================================================
// #endregion Server Variables
//================================================================================
