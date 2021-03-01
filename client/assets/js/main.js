function Dashboard_Click() {
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("product_list").style.display = "none";
  document.getElementById("page_heading").innerHTML = "Dashboard";
}

function Product_Click() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("product_list").style.display = "block";
  document.getElementById("page_heading").innerHTML = "Product List";
}
