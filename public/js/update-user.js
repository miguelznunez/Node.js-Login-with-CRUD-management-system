const updateUserForm = document.querySelector("#update-user-form"),
serverMessage = document.querySelector(".server-message");

updateUserForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const id = document.querySelector("#id").value,
  fName = document.querySelector("#fName").value,
  lName = document.querySelector("#lName").value,
  email = document.querySelector("#email").value,
  banned = document.querySelector("input[name=banned]:checked").value,
  admin = document.querySelector("input[name=admin]:checked").value;

  fetch(`/user-management/update-user`, {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-type": "application/json"
    },
    body: JSON.stringify({ id: id, fName: fName, lName: lName, email: email, banned:banned, admin:admin})
  })

  .then( response => {
    if (response.status !== 200) throw Error(response.statusText)
    serverMessage.innerHTML = response.statusText
    serverMessage.style.cssText = "background-color: #d4edda; color:#1b5e20; padding: 16px;"
  })

  .catch(error => {
    serverMessage.innerHTML = error.toString().split(": ")[1]
    serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c; padding: 16px;"
  })

})