//================================================================================
// #region Server Variables
//================================================================================

const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const bcrypt = require("bcrypt");
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

app.use(express.static(__dirname + "/client"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/login.html");
});

app.get("/home", function (req, res) {
  res.sendFile(__dirname + "/client/home.html");
});

var BCRYPT_SALT_ROUNDS = 12;

//================================================================================
// #endregion Server Config
//================================================================================

//================================================================================
// #region Server Hosting
//================================================================================

http.listen(port, () => {
  console.log("We are live on " + port);
  // bcrypt
  //   .hash("test1234", BCRYPT_SALT_ROUNDS)
  //   .then(function (hashedPassword) {
  //     console.log(hashedPassword);
  //   })
  //   .catch(function (error) {
  //     console.log("Error saving user: ");
  //     console.log(error);
  //     next();
  //   });
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
      bcrypt.compare(data.password, checkUser.password, function (err, result) {
        if (result == true) {
          socket.emit("Verified", {});
          socket.loggedIn = true;
        } else {
          socket.emit("Failed", {});
          socket.loggedIn = false;
        }
      });
    } catch (error) {
      socket.emit("Error", { error: error });
    }
  });

  //create product
  socket.on("Create_Product", async function (data) {
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_product = db.collection("Products");
        const product = {
          Product_Name: data.Product_Name,
          Description: data.Description,
          Raw_Materials: data.Raw_Materials,
          Price: parseInt(data.Price),
        };
        const productInsert = await collection_product.insertOne(
          product,
          async function (err, result) {
            if (err) return socket.emit("Error", { error: err });
            const checkProduct = await collection_product.find({}).toArray();
            socket.emit("Product_Created", {
              product: checkProduct,
            });
          }
        );
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //read products
  socket.on("Get_Products", async function (data) {
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_product = db.collection("Products");
        const productGet = await collection_product.find({}).toArray();
        socket.emit("Got_Products", {
          product: productGet,
        });
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //delete product
  socket.on("Delete_Product", async function (data) {
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_product = db.collection("Products");
        const deleteProduct = await collection_product.deleteOne(
          {
            _id: ObjectId(data.productID),
          },
          true
        );
        const checkProduct = await collection_product.find({}).toArray();
        if (deleteProduct) {
          socket.emit("Deleted_Product", { product: checkProduct });
        } else {
          socket.emit("Error", { error: "Failed to delete product" });
        }
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //get product list
  socket.on("Get_Product_List", async function (data) {
    console.log("ran");
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_product = db.collection("Products");
        const productGet = await collection_product.find({}).toArray();
        socket.emit("Got_Product_List", {
          Product_List: productGet,
        });
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //create finished product
  socket.on("Add_Finished_Product", async function (data) {
    console.info(data);
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_stock = db.collection("Stock");
        const collection_products = db.collection("Products");
        const collection_raw = db.collection("Raw_Materials");
        const collection_prod = db.collection("Production");
        const getProduct = await collection_products.findOne({
          Product_Name: data.Finished_Product,
        });
        var rawMaterials = getProduct.Raw_Materials;
        var foam = parseFloat(rawMaterials.Foam) * parseFloat(data.Quantity);
        var material =
          parseFloat(rawMaterials.Material) * parseFloat(data.Quantity);
        var tape = parseFloat(rawMaterials.Tape) * parseFloat(data.Quantity);
        var plastic =
          parseFloat(rawMaterials.Plastic) * parseFloat(data.Quantity);
        var spun_bond =
          parseFloat(rawMaterials.Spun_Bond) * parseFloat(data.Quantity);
        var batting =
          parseFloat(rawMaterials.Batting) * parseFloat(data.Quantity);
        var spring =
          parseFloat(rawMaterials.Spring) * parseFloat(data.Quantity);

        var newFoam = 0;
        var newMaterial = 0;
        var newTape = 0;
        var newPlastic = 0;
        var newSpun = 0;
        var newBatting = 0;
        var newSpring = 0;

        var newFoamV = false;
        var newMaterialV = false;
        var newTapeV = false;
        var newPlasticV = false;
        var newSpunV = false;
        var newBattingV = false;
        var newSpringV = false;

        const rawGet = await collection_raw.find({}).toArray();
        for (let i = 0; i < rawGet.length; i++) {
          const rawMaterialName = rawGet[i].Name;
          const rawMaterialQuantity = rawGet[i].Quantity;
          if (
            rawMaterialName == "Foam" &&
            parseFloat(rawMaterialQuantity) > foam
          ) {
            newFoam = parseFloat(rawMaterialQuantity) - foam;
            const rawUpdate = await collection_raw.updateOne(
              {
                Name: rawMaterialName,
              },
              {
                $set: {
                  Quantity: newFoam,
                },
              },
              async function (err, result) {
                if (err) return console.error(err);
                newFoamV = true;
                // console.log("Updated");
              }
            );
          }
          // else {
          //   socket.emit("Error", {
          //     error: "Not enough raw materials to make this product",
          //   });
          //   break;
          // }
          if (
            rawMaterialName == "Material" &&
            parseFloat(rawMaterialQuantity) > material
          ) {
            newMaterial = parseFloat(rawMaterialQuantity) - material;
            const rawUpdate = await collection_raw.updateOne(
              {
                Name: rawMaterialName,
              },
              {
                $set: {
                  Quantity: newMaterial,
                },
              },
              async function (err, result) {
                if (err) return console.error(err);
                newMaterialV = true;
                // console.log("Updated");
              }
            );
          }
          // else {
          //   socket.emit("Error", {
          //     error: "Not enough raw materials to make this product",
          //   });
          //   break;
          // }
          if (
            rawMaterialName == "Tape" &&
            parseFloat(rawMaterialQuantity) > tape
          ) {
            newTape = parseFloat(rawMaterialQuantity) - tape;
            const rawUpdate = await collection_raw.updateOne(
              {
                Name: rawMaterialName,
              },
              {
                $set: {
                  Quantity: newTape,
                },
              },
              async function (err, result) {
                if (err) return console.error(err);
                newTapeV = true;
                // console.log("Updated");
              }
            );
          }
          // else {
          //   socket.emit("Error", {
          //     error: "Not enough raw materials to make this product",
          //   });
          //   break;
          // }
          if (
            rawMaterialName == "Plastic" &&
            parseFloat(rawMaterialQuantity) > plastic
          ) {
            newPlastic = parseFloat(rawMaterialQuantity) - plastic;
            const rawUpdate = await collection_raw.updateOne(
              {
                Name: rawMaterialName,
              },
              {
                $set: {
                  Quantity: newPlastic,
                },
              },
              async function (err, result) {
                if (err) return console.error(err);
                newPlasticV = true;
                // console.log("Updated");
              }
            );
          }
          // else {
          //   socket.emit("Error", {
          //     error: "Not enough raw materials to make this product",
          //   });
          //   break;
          // }
          if (
            rawMaterialName == "Spun_Bond" &&
            parseFloat(rawMaterialQuantity) > spun_bond
          ) {
            newSpun = parseFloat(rawMaterialQuantity) - spun_bond;
            const rawUpdate = await collection_raw.updateOne(
              {
                Name: rawMaterialName,
              },
              {
                $set: {
                  Quantity: newSpun,
                },
              },
              async function (err, result) {
                if (err) return console.error(err);
                newSpunV = true;
                // console.log("Updated");
              }
            );
          }
          // else {
          //   socket.emit("Error", {
          //     error: "Not enough raw materials to make this product",
          //   });
          //   break;
          // }
          if (
            rawMaterialName == "Batting" &&
            parseFloat(rawMaterialQuantity) > batting
          ) {
            newBatting = parseFloat(rawMaterialQuantity) - batting;
            const rawUpdate = await collection_raw.updateOne(
              {
                Name: rawMaterialName,
              },
              {
                $set: {
                  Quantity: newBatting,
                },
              },
              async function (err, result) {
                if (err) return console.error(err);
                newBattingV = true;
                // console.log("Updated");
              }
            );
          }
          // else {
          //   socket.emit("Error", {
          //     error: "Not enough raw materials to make this product",
          //   });
          //   break;
          // }
          if (
            rawMaterialName == "Spring" &&
            parseFloat(rawMaterialQuantity) > spring
          ) {
            newSpring = parseFloat(rawMaterialQuantity) - spring;
            const rawUpdate = await collection_raw.updateOne(
              {
                Name: rawMaterialName,
              },
              {
                $set: {
                  Quantity: newSpring,
                },
              },
              async function (err, result) {
                if (err) return console.error(err);
                newSpringV = true;
                // console.log("Updated");
              }
            );
          }
          // else {
          //   socket.emit("Error", {
          //     error: "Not enough raw materials to make this product",
          //   });
          //   break;
          // }
        }

        // if (
        //   newFoamV == true &&
        //   newMaterialV == true &&
        //   newTapeV == true &&
        //   newPlasticV == true &&
        //   newSpunV == true &&
        //   newSpringV == true &&
        //   newBattingV == true
        // ) {
        // console.log("Ran stock update");

        const stockProduct = await collection_stock.findOne({
          Name: getProduct.Product_Name,
        });

        const finishedUpdate = await collection_stock.updateOne(
          {
            Name: getProduct.Product_Name,
          },
          {
            $set: {
              Quantity:
                parseFloat(stockProduct.Quantity) + parseFloat(data.Quantity),
            },
          },
          async function (err, result) {
            if (err) return console.error(err);
            if (result) {
              // console.log("Ran product update");
              const product = {
                Name: getProduct.Product_Name,
                Quantity: parseFloat(data.Quantity),
                Date: Date.now(),
              };
              const productInsert = await collection_prod.insertOne(
                product,
                async function (err, result) {
                  if (err) return socket.emit("Error", { error: err });
                  const checkStock = await collection_stock.find({}).toArray();
                  socket.emit("Finished_Product_Added", {
                    stock: checkStock,
                  });
                }
              );
            }
          }
        );
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //read finished products
  socket.on("Get_Finished_Products", async function (data) {
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_stock = db.collection("Stock");
        const stockGet = await collection_stock.find({}).toArray();
        socket.emit("Got_Finished_Products", {
          stock: stockGet,
        });
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //get all finished products
  socket.on("Get_Finished_Products_Date", async function (data) {
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
          socket.emit("Got_Finished_Products", { products: checkProduct });
        } else {
          socket.emit("Error", { error: "Failed to get finished products" });
        }
      } catch (error) {
        socket.emit("Error", { error: error });
      }
    }
  });

  //delete finished product
  socket.on("Delete_Finished_Product", async function (data) {
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

  //add raw materials
  socket.on("Add_Raw_Material", async function (data) {
    console.info(data);
    console.log(socket.loggedIn);
    if ((socket.loggedIn = true)) {
      try {
        const db = clientDB.db("314IT");
        const collection_raw = db.collection("Raw_Materials");
        const rawFind = await collection_raw.findOne({
          Name: data.Raw_Material,
        });
        var newQuantity =
          parseFloat(rawFind.Quantity) + parseFloat(data.Quantity);
        const raw = {
          Name: data.Raw_Material,
          Quantity: data.Amount,
        };
        const rawInsert = await collection_raw.updateOne(
          {
            Name: rawFind.Name,
          },
          {
            $set: {
              Quantity: newQuantity,
            },
          },
          async function (err, result) {
            if (err) return console.error(err);
            if (result) {
              const checkRaw = await collection_raw.find({}).toArray();
              socket.emit("Raw_Added", {
                raw: checkRaw,
              });
            } else {
              socket.emit("Error", {
                error: "Failed to get raw materials",
              });
            }
          }
        );
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
        const checkRaw = await collection_raw.find({}).toArray();
        if (checkRaw) {
          socket.emit("Got_Raw_Materials", { raw: checkRaw });
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
