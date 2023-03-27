// show/hide password
const showPassword = document.querySelector("#show-password");
const passwordField = document.querySelector("#password");
const passwordMatchField = document.querySelector("#confirm-password");

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

const passwordUpdateForm = document.querySelector("#password-update-form"),
serverMessage = document.querySelector(".server-message");

passwordUpdateForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const password = document.querySelector("#password").value,
  cPassword = document.querySelector("#confirm-password").value,
  token = document.querySelector("#token").value,
  tExpires = document.querySelector("#tExpires").value,
  id = document.querySelector("#id").value;

  console.log(token)

  fetch("/auth/password-update", {
    method: "PUT",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-type": "application/json"
    },
    body: JSON.stringify({ id: id, token: token, tExpires: tExpires, password:password, cPassword:cPassword})
  })

  .then( response => {
    if (response.status !== 200) throw Error(response.statusText)
    passwordUpdateForm.innerHTML = ""
    serverMessage.innerHTML = response.statusText
    serverMessage.style.cssText = "background-color: #d4edda; color:#1b5e20; padding: 16px;"
  })

  .catch(error => {
    serverMessage.innerHTML = error.toString().split(": ")[1]
    serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c; padding: 16px;"
  })

})
