const eForm = document.querySelector("#create-email-form");
serverMessage = document.querySelector(".server-message");

eForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const subject = document.querySelector("#subject").value;
  const emailTextarea = tinymce.get('emailTextarea').getContent()

  fetch("/newsletter-management/newsletter-views/send-newsletter-email", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-type": "application/json"
    },
    body: JSON.stringify({ subject:subject, emailTextarea:emailTextarea })
  })

  .then( response => response.json() )

  .then( response => {
    if (response.status !== 200) throw Error(response.statusText)
    // eForm.reset()
    serverMessage.innerHTML = response.statusText
    serverMessage.style.cssText = "background-color: #d4edda; color:#1b5e20; padding: 12px;border-radius:5px;width:100%;"
    setTimeout(removeServerMessage, 15000)
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