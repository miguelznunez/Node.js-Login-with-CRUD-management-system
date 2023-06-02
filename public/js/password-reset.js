const passwordResetForm = document.querySelector("#password-reset-form"),
serverMessage = document.querySelector(".server-message");

passwordResetForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const email = document.querySelector("#email").value,
  captcha = document.querySelector("#g-recaptcha-response").value;

  fetch("/auth-management/auth-views/password-reset", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-type": "application/json"
    },
    body: JSON.stringify({ email:email, captcha:captcha })
  })

  .then( response => response.json() )

  .then( response => {
    if (response.status !== 200) throw Error(response.statusMessage)
    passwordResetForm.reset()
    serverMessage.innerHTML = response.statusMessage
    serverMessage.style.cssText = "background-color: #d4edda; color:#1b5e20; padding: 16px;"
  })

  .catch(error => {
    serverMessage.innerHTML = error.toString().split(": ")[1]
    serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c; padding: 16px;"
  })

})
