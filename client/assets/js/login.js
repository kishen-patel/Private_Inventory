var socket = io();

function Authenticate() {
  var loginCookieValue = getCookie("Login");
  if (loginCookieValue == "true") {
    window.location.replace("http://localhost:3000/home");
  } else {
    console.log("Not Logged In");
  }
}

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  const username = loginForm.username.value;
  const password = loginForm.password.value;
  loginErrorMsg.style.opacity = 0;
  socket.emit("Login", {
    username: username,
    password: password,
  });
});

socket.on("Verified", function (data) {
  loginErrorMsg.style.opacity = 0;
  setCookie("Login", "true", 1);
  window.location.replace("http://localhost:3000/home");
});
socket.on("Failed", function (data) {
  loginErrorMsg.style.opacity = 1;
  setCookie("Login", "false", 1);
});

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
