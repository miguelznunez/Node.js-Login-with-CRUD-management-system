const delAccountForm = document.querySelector("#delete-account-form"),
serverMessage = document.querySelector(".server-message");

delAccountForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const id = document.querySelector("#id").value,
  email = document.querySelector("#email").value;
  fetch("/profile-management/profile-views/delete-account", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-type": "application/json"
    },
    body: JSON.stringify({ id:id, email:email })
  })

  .then( response => response.json() )

  .then( response => {
    if (response.status !== 200) throw Error(response.statusMessage)
    window.open("/auth-management/auth-views/logout", "_self")
  })

  .catch(error => {
    serverMessage.innerHTML = error.toString().split(": ")[1]
    serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c; padding: 12px;border-radius:5px;width:100%;"
    setTimeout(removeServerMessage, 15000)
  })

})

function removeServerMessage(){
  serverMessage.innerHTML = ""
  serverMessage.removeAttribute("style")
}