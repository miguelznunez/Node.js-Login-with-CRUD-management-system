const showPassword = document.querySelector("#show-password"),
passwordField = document.querySelector("#password"),
loginForm = document.querySelector("#login-form"),
serverMessage = document.querySelector(".server-message");

showPassword.addEventListener("click", function (e) {
  if (showPassword.checked)
    passwordField.setAttribute("type", "text");
  else
    passwordField.setAttribute("type", "password");
})

loginForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const email = document.querySelector("#email").value,
  password = document.querySelector("#password").value;

  fetch("/auth-management/auth-views/login", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-type": "application/json"
    },
    body: JSON.stringify({ email: email, password:password })
  })

  .then( response => response.json() )

  .then( response => {
    if (response.status !== 200) throw Error(response.statusMessage)
    window.open("http://localhost:5000/", "_self");
  })

  .catch(error => {
    serverMessage.innerHTML = error.toString().split(": ")[1]
    serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c; padding: 16px;"
  })

})
