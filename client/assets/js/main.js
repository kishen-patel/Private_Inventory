var socket = io();

function Dashboard_Click() {
  md.initDashboardPageCharts();
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("inventory_list").style.display = "none";
  document.getElementById("product_list").style.display = "none";
  document.getElementById("Dashboard_Button").setAttribute("class", "active");
  document
    .getElementById("Inventory_Button")
    .removeAttribute("class", "active");
  document.getElementById("Product_Button").removeAttribute("class", "active");
}

function Inventory_Click() {
  socket.emit("Get_Raw_Materials", {});
  socket.emit("Get_Finished_Products", {});
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("product_list").style.display = "none";
  document.getElementById("inventory_list").style.display = "block";
  document.getElementById("Inventory_Button").setAttribute("class", "active");
  document
    .getElementById("Dashboard_Button")
    .removeAttribute("class", "active");
  document.getElementById("Product_Button").removeAttribute("class", "active");
}

function Product_Click() {
  socket.emit("Get_Products", {});
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("product_list").style.display = "block";
  document.getElementById("inventory_list").style.display = "none";
  document.getElementById("Product_Button").setAttribute("class", "active");
  document
    .getElementById("Inventory_Button")
    .removeAttribute("class", "active");
  document
    .getElementById("Dashboard_Button")
    .removeAttribute("class", "active");
}

function ChartLoader() {
  md.initDashboardPageCharts();
}

function AddProduct() {
  var productName = document.getElementById("productNameInput").value;
  var productDescription = document.getElementById("productDescriptionInput")
    .value;
  var foam = document.getElementById("foamInput").value;
  var material = document.getElementById("materialInput").value;
  var tape = document.getElementById("tapeInput").value;
  var plastic = document.getElementById("plasticInput").value;
  var spun = document.getElementById("spunInput").value;
  var batting = document.getElementById("battingInput").value;
  var spring = document.getElementById("springInput").value;
  var price = document.getElementById("priceInput").value;

  var raw_materials = {
    Foam: foam,
    Material: material,
    Tape: tape,
    Plastic: plastic,
    Spun_Bond: spun,
    Batting: batting,
    Spring: spring,
  };
  if (
    productName != "" &&
    productDescription != "" &&
    foam != "" &&
    material != "" &&
    tape != "" &&
    plastic != "" &&
    spun != "" &&
    batting != "" &&
    price != "" &&
    spring != ""
  ) {
    socket.emit("Create_Product", {
      Product_Name: productName,
      Description: productDescription,
      Raw_Materials: raw_materials,
      Price: parseInt(price),
    });
  } else {
    alert("Please fill in all fields to add a new product.");
  }
}

socket.on("Product_Created", function (data) {
  $("#product-info")[0].reset();
  $("#productModal").modal("hide");
  $("#successModal").modal("show");
  RefreshProductTable(data);
});

socket.on("Got_Products", function (data) {
  RefreshProductTable(data);
});

var deleteID = "";

function DeleteProduct(element) {
  var $item = $(element).closest("tr").find(".product_ID").text();
  deleteID = $item;
  console.log(deleteID);
}

function DeleteProductID() {
  if (deleteID != "") {
    socket.emit("Delete_Product", {
      productID: deleteID,
    });
  }
}

function RefreshProductTable(data) {
  var table = document.getElementById("product-table");
  var totalRowCount = table.tBodies[0].rows.length;
  for (let index = 0; index < totalRowCount; index++) {
    document
      .getElementById("product-tbody")
      .removeChild(document.getElementById("product-tbody").childNodes[0]);
  }
  var tbdy = document.getElementById("product-tbody");
  for (let i = 0; i < data.product.length; i++) {
    var tr = document.createElement("tr");
    var tdID = document.createElement("td");
    var tdName = document.createElement("td");
    var tdDescription = document.createElement("td");
    var tdFoam = document.createElement("td");
    var tdMaterial = document.createElement("td");
    var tdTape = document.createElement("td");
    var tdPlastic = document.createElement("td");
    var tdSpun = document.createElement("td");
    var tdBatting = document.createElement("td");
    var tdSpring = document.createElement("td");
    var tdPrice = document.createElement("td");
    var tdDelete = document.createElement("td");

    tdID.innerHTML = data.product[i]._id;
    tdID.setAttribute("class", "product_ID");
    tdName.innerHTML = data.product[i].Product_Name;
    tdDescription.innerHTML = data.product[i].Description;
    tdFoam.innerHTML = data.product[i].Raw_Materials.Foam;
    tdMaterial.innerHTML = data.product[i].Raw_Materials.Material;
    tdTape.innerHTML = data.product[i].Raw_Materials.Tape;
    tdPlastic.innerHTML = data.product[i].Raw_Materials.Plastic;
    tdSpun.innerHTML = data.product[i].Raw_Materials.Spun_Bond;
    tdBatting.innerHTML = data.product[i].Raw_Materials.Batting;
    tdSpring.innerHTML = data.product[i].Raw_Materials.Spring;
    tdPrice.innerHTML = data.product[i].Price;
    tdDelete.innerHTML =
      "<button type='button' rel='tooltip' class='btn btn-danger text-right' onclick='DeleteProduct(this)' id='deleteProduct' data-toggle='modal' data-target='#deleteModal'><i class='material-icons'>delete</i></button>";

    tr.appendChild(tdID);
    tr.appendChild(tdName);
    tr.appendChild(tdDescription);
    tr.appendChild(tdFoam);
    tr.appendChild(tdMaterial);
    tr.appendChild(tdTape);
    tr.appendChild(tdPlastic);
    tr.appendChild(tdSpun);
    tr.appendChild(tdBatting);
    tr.appendChild(tdSpring);
    tr.appendChild(tdPrice);
    tr.appendChild(tdDelete);

    tbdy.appendChild(tr);
  }
}

socket.on("Deleted_Product", function (data) {
  $("#deleteModal").modal("hide");
  $("#successModal").modal("show");
  RefreshProductTable(data);
});

function AddRaw() {
  var rawMaterialSelect = document.getElementById("rawSelect").value;
  var rawMaterialAmount = document.getElementById("rawAmount").value;
  socket.emit("Add_Raw_Material", {
    Raw_Material: rawMaterialSelect,
    Quantity: rawMaterialAmount,
  });
}

socket.on("Raw_Added", function (data) {
  $("#raw-info")[0].reset();
  $("#rawModal").modal("hide");
  $("#successModal").modal("show");
  RefreshRawTable(data);
});

function RefreshRawTable(data) {
  var table = document.getElementById("raw-table");
  var totalRowCount = table.tBodies[0].rows.length;
  for (let index = 0; index < totalRowCount; index++) {
    document
      .getElementById("raw-tbody")
      .removeChild(document.getElementById("raw-tbody").childNodes[0]);
  }
  var tbdy = document.getElementById("raw-tbody");
  for (let i = 0; i < data.raw.length; i++) {
    var tr = document.createElement("tr");
    var tdID = document.createElement("td");
    var tdName = document.createElement("td");
    var tdQuantity = document.createElement("td");
    var tdPrice = document.createElement("td");
    var tdTotalPrice = document.createElement("td");
    // var tdDelete = document.createElement("td");

    tdID.innerHTML = data.raw[i]._id;
    tdID.setAttribute("class", "raw_ID");
    tdName.innerHTML = data.raw[i].Name;
    tdPrice.innerHTML = data.raw[i].Price;
    tdQuantity.innerHTML = data.raw[i].Quantity;
    tdTotalPrice.innerHTML =
      parseFloat(data.raw[i].Quantity) * parseFloat(data.raw[i].Price);
    // tdDelete.innerHTML =
    // "<button type='button' rel='tooltip' class='btn btn-danger text-right' onclick='DeleteRaw(this)' id='deleteRaw' data-toggle='modal' data-target='#deleteRawModal'><i class='material-icons'>delete</i></button>";

    tr.appendChild(tdID);
    tr.appendChild(tdName);
    tr.appendChild(tdQuantity);
    tr.appendChild(tdPrice);
    tr.appendChild(tdTotalPrice);
    // tr.appendChild(tdDelete);

    tbdy.appendChild(tr);
  }
}

socket.on("Got_Raw_Materials", function (data) {
  RefreshRawTable(data);
});

function AddFinishedList() {
  socket.emit("Get_Product_List", {});
}

socket.on("Got_Product_List", function (data) {
  var options = document.querySelectorAll("#finishedOption");
  options.forEach((o) => o.remove());
  $("#finished-info")[0].reset();

  for (let i = 0; i < data.Product_List.length; i++) {
    var finishedSelect = document.getElementById("finishedSelect");
    var options = document.createElement("option");
    options.setAttribute("id", "finishedOption");
    options.text = data.Product_List[i].Product_Name;
    finishedSelect.add(options);
  }
});

function AddFinished() {
  var finishedSelect = document.getElementById("finishedSelect").value;
  var finishedAmount = document.getElementById("finishedAmount").value;
  socket.emit("Add_Finished_Product", {
    Finished_Product: finishedSelect,
    Quantity: finishedAmount,
  });
}

socket.on("Finished_Product_Added", function (data) {
  $("#finished-info")[0].reset();
  $("#finishedModal").modal("hide");
  $("#successModal").modal("show");
  Inventory_Click();
});

function RefreshFinishedTable(data) {
  var table = document.getElementById("finished-table");
  var totalRowCount = table.tBodies[0].rows.length;
  for (let index = 0; index < totalRowCount; index++) {
    document
      .getElementById("finished-tbody")
      .removeChild(document.getElementById("finished-tbody").childNodes[0]);
  }
  var tbdy = document.getElementById("finished-tbody");
  for (let i = 0; i < data.stock.length; i++) {
    var tr = document.createElement("tr");
    var tdID = document.createElement("td");
    var tdName = document.createElement("td");
    var tdDescription = document.createElement("td");
    var tdPrice = document.createElement("td");
    var tdQuantity = document.createElement("td");

    tdID.innerHTML = data.stock[i]._id;
    tdID.setAttribute("class", "finished_ID");
    tdName.innerHTML = data.stock[i].Name;
    tdDescription.innerHTML = data.stock[i].Description;
    tdQuantity.innerHTML = data.stock[i].Quantity;
    tdPrice.innerHTML = data.stock[i].Price;
    // tdDelete.innerHTML =
    //   "<button type='button' rel='tooltip' class='btn btn-danger text-right' onclick='DeleteProduct(this)' id='deleteProduct' data-toggle='modal' data-target='#deleteModal'><i class='material-icons'>delete</i></button>";

    tr.appendChild(tdID);
    tr.appendChild(tdName);
    tr.appendChild(tdDescription);
    tr.appendChild(tdQuantity);
    tr.appendChild(tdPrice);
    // tr.appendChild(tdDelete);

    tbdy.appendChild(tr);
  }
}

socket.on("Got_Finished_Products", function (data) {
  RefreshFinishedTable(data);
});
