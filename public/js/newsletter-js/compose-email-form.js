const composeEmailForm = document.querySelector("#compose-email-form");
serverMessage = document.querySelector(".server-message"),
btn = document.querySelector(".button");

composeEmailForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const subject = document.querySelector("#subject").value,
  message = tinymce.get("message").getContent();

  btn.classList.add("button--loading");
  btn.disabled = true

  fetch("/newsletter-management/newsletter-views/send-newsletter-email", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-type": "application/json"
    },
    body: JSON.stringify({ subject:subject, message:message })
  })

  .then( response => response.json() )

  .then( response => {
    if (response.status !== 200) throw Error(response.statusMessage)
    composeEmailForm.reset()
    serverMessage.innerHTML = response.statusMessage
    serverMessage.style.cssText = "background-color: #d4edda; color:#1b5e20; padding: 12px;border-radius:5px;width:100%;"
    btn.classList.remove("button--loading")
    btn.disabled = false
  })

  .catch(error => {
    serverMessage.innerHTML = error.toString().split(": ")[1]
    serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c; padding: 12px;border-radius:5px;width:100%;"
    btn.classList.remove("button--loading")
    btn.disabled = false
  })

})