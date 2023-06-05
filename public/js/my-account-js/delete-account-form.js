const delAccountForm = document.querySelector("#delete-account-form"),
serverMessage = document.querySelector(".server-message"),
btn = document.querySelector(".button");

delAccountForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const id = document.querySelector("#id").value,
  email = document.querySelector("#email").value;

  btn.classList.add("button--loading");
  btn.disabled = true

  fetch("/my-account-management/my-account-views/delete-account", {
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
    btn.classList.remove("button--loading")
    btn.disabled = false
    window.open("/auth-management/auth-views/logout", "_self")
  })

  .catch(error => {
    serverMessage.innerHTML = error.toString().split(": ")[1]
    serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c; padding: 12px;border-radius:5px;width:100%;"
    btn.classList.remove("button--loading")
    btn.disabled = false
  })

})