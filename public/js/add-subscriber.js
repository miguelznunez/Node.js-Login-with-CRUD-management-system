const addSubForm = document.querySelector("#add-subscriber-form"),
serverMessage = document.querySelector(".server-message");

addSubForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const nEmail = document.querySelector("#nEmail").value;

  fetch("/newsletter-management/newsletter-views/add-subscriber", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-type": "application/json"
    },
    body: JSON.stringify({ nEmail: nEmail})
  })

  .then( response => response.json() )

  .then( response => {
    if (response.status !== 200) throw Error(response.statusMessage)
    addSubForm.reset()
    serverMessage.innerHTML = response.statusMessage
    serverMessage.style.cssText = "background-color: #d4edda; color:#1b5e20; padding: 16px;"
  })

  .catch(error => {
    serverMessage.innerHTML = error.toString().split(": ")[1]
    serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c; padding: 16px;"
  })

})