function Dashboard_Click() {
  md.initDashboardPageCharts();
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("inventory_list").style.display = "none";
}

function Inventory_Click() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("inventory_list").style.display = "block";
}

function ChartLoader(){
  md.initDashboardPageCharts();
}
