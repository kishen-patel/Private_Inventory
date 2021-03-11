//================================================================================
// #region Server Variables
//================================================================================

const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const fs = require("fs");
const bodyParser = require("body-parser");
const uri =
  "mongodb+srv://314IT:Final314IT@cluster0.jd8k7.mongodb.net/Private_Inventory?retryWrites=true&w=majority";
const app = express();
const port = 3000;
var http = require("http").Server(app);
var io = require("socket.io")(http);
let clientDB = null;

//================================================================================
// #endregion Server Variables
//================================================================================

//================================================================================
// #region Server Config
//================================================================================

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

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/client/login.html");
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

//================================================================================
// #endregion Server Config
//================================================================================

//================================================================================
// #region Server Hosting
//================================================================================

http.listen(port, () => {
  console.log("We are live on " + port);
});

//================================================================================
// #endregion Server Hosting
//================================================================================

//================================================================================
// #region Socket.IO
//================================================================================

io.on("connection", async function (socket) {
  if ((clientDB && !clientDB.isConnected()) || clientDB === null) {
    clientDB = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  //check login details
  socket.on("Login", async function (data) {
    console.info(data);
    try {
      const db = clientDB.db("314IT");
      const collection_users = db.collection("Users");
      const checkUser = await collection_users.findOne(
        {
          username: data.username,
        },
        {
          projection: {
            _id: 1,
            password: 1,
          },
        }
      );
      console.info(checkUser);
      if (checkUser && checkUser.password == data.password) {
        socket.emit("Verified", {});
        socket.loggedIn = true;
      } else {
        console.log("invalid credentials");
        socket.emit("Failed", {});
        socket.loggedIn = false;
      }
    } catch (error) {
      socket.emit("Error", { error: error });
    }
  });

  //create finished product
  socket.on("Create_Product", async function (data) {
    console.info(data);
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_stock = db.collection("Stock");
        const stock = {
          Name: data.name,
          Description: data.description,
          Quantity: data.quantity,
          Price: parseInt(data.price),
        };
        const stockInsert = await collection_stock.insertOne(
          stock,
          (err, result) => {
            if (err) return console.error(err);
            console.info(stockInsert.ops);
            socket.emit("Product_Added", {
              product: stock,
            });
            console.info(result);
          }
        );
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //get all finished products
  socket.on("Get_Products", async function (data) {
    console.info(data);
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_stock = db.collection("Stock");
        const checkProduct = await collection_stock
          .find({
            date_added: {
              $gte: new Date(new Date(data.startDate).setHours(00, 00, 00)),
              $lt: new Date(new Date(data.endDate).setHours(23, 59, 59)),
            },
          })
          .toArray();
        //2020-02-12 date
        console.info(checkProduct);
        if (checkProduct) {
          socket.emit("Got_Products", { products: checkProduct });
        } else {
          socket.emit("Error", { error: "Failed to get finished products" });
        }
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //delete finished product
  socket.on("Delete_Product", async function (data) {
    console.info(data);
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_stock = db.collection("Stock");
        const deleteProduct = await collection_stock.deleteOne(
          {
            _id: ObjectId(data.productID),
          },
          true
        );
        console.info(deleteProduct);
        const checkProduct = await collection_stock.find({});
        if (deleteProduct) {
          socket.emit("Deleted_Product", { products: checkProduct });
        } else {
          socket.emit("Error", { error: "Failed to get finished products" });
        }
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //create raw material
  socket.on("Create_Raw_Material", async function (data) {
    console.info(data);
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_raw = db.collection("Raw_Materials");
        const raw = {
          Name: data.name,
          Description: data.description,
          Quantity: data.quantity,
          Price: parseInt(data.price),
        };
        const rawInsert = await collection_raw.insertOne(raw, (err, result) => {
          if (err) return console.error(err);
          console.info(rawInsert.ops);
          socket.emit("Raw_Added", {
            raw: raw,
          });
          console.info(result);
        });
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //get all raw materials
  socket.on("Get_Raw_Materials", async function (data) {
    console.info(data);
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_raw = db.collection("Raw_Materials");
        const checkRaw = await collection_raw.find({});
        console.info(checkRaw);
        if (checkRaw) {
          socket.emit("Got_Raw_Materuaks", { raw_materials: checkRaw });
        } else {
          socket.emit("Error", { error: "Failed to get raw materials" });
        }
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //delete raw material
  socket.on("Delete_Raw_Material", async function (data) {
    console.info(data);
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_raw = db.collection("Raw_Materials");
        const deleteRaw = await collection_raw.deleteOne(
          {
            _id: ObjectId(data.rawID),
          },
          true
        );
        console.info(deleteRaw);
        const checkRaw = await collection_raw.find({});
        if (deleteProduct) {
          socket.emit("Deleted_Product", { raw_materials: checkRaw });
        } else {
          socket.emit("Error", { error: "Failed to get finished products" });
        }
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });
});

//================================================================================
// #endregion Socket.IO
//================================================================================
