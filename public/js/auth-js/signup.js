const showPassword = document.querySelector("#show-password"),
passwordField = document.querySelector("#password"),
passwordMatchField = document.querySelector("#confirm-password"),
signupForm = document.querySelector("#signup-form"),
serverMessage = document.querySelector(".server-message"),
btn = document.querySelector(".button");

showPassword.addEventListener("click", function (e) {
  if (showPassword.checked) {
    passwordField.setAttribute("type", "text");
    passwordMatchField.setAttribute("type", "text");
  }
  else {
    passwordField.setAttribute("type", "password");
    passwordMatchField.setAttribute("type", "password");
  }
})

signupForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const fName = document.querySelector("#fName").value,
  lName = document.querySelector("#lName").value,
  email = document.querySelector("#email").value,
  password = document.querySelector("#password").value,
  cPassword = document.querySelector("#confirm-password").value;
 
  btn.classList.add("button--loading");
  btn.disabled = true

  fetch("/auth-management/auth-views/signup", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-type": "application/json"
    },
    body: JSON.stringify({ fName: fName, lName: lName, email: email, password:password, cPassword:cPassword})
  })

  .then( response => response.json() )

  .then( response => {
    if (response.status !== 200) throw Error(response.statusMessage)
    signupForm.reset()
    serverMessage.innerHTML = response.statusMessage
    serverMessage.style.cssText = "background-color: #d4edda; color:#1b5e20; padding: 16px;"
    btn.classList.remove("button--loading");
    btn.disabled = false
  })

  .catch(error => {
    serverMessage.innerHTML = error.toString().split(": ")[1]
    serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c; padding: 16px;"
    btn.classList.remove("button--loading");
    btn.disabled = false
  })

})