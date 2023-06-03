const nForm = document.querySelector("#newsletter-form"),
serverMessage = document.querySelector(".server-message"),
formInput = document.querySelector(".form-input"),
btn = document.querySelector(".button");

nForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const email = document.querySelector("#email").value

  btn.classList.add("button--loading");
  btn.disabled = true

  fetch("/newsletter-form", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-type": "application/json"
    },
    body: JSON.stringify({ email:email })
  })

  .then( response => response.json() )

  .then( response => {
    if (response.status !== 200) throw Error(response.statusMessage)
    formInput.innerHTML = ""
    serverMessage.innerHTML = response.statusMessage
    serverMessage.style.cssText = "background-color: #d4edda; color:#1b5e20; padding: 12px;border-radius:5px;width:100%;"
    btn.classList.remove("button--loading")
    btn.disabled = false
    setTimeout(removeServerMessage, 15000)
  })

  .catch(error => {
    serverMessage.innerHTML = error.toString().split(": ")[1]
    serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c; padding: 12px;border-radius:5px;width:100%;"
    btn.classList.remove("button--loading")
    btn.disabled = false
    setTimeout(removeServerMessage, 15000)
  })

})

function removeServerMessage(){
  serverMessage.innerHTML = ""
  serverMessage.removeAttribute("style")
}