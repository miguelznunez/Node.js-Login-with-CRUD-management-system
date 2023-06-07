const modalOverlay = document.querySelector(".modal-overlay");

document.querySelector("#show-modal").addEventListener("click", () => {
  if(removeEmails != ""){
    modalOverlay.style.display = "block";
  } else {
    serverMessage.innerHTML = "Please select at least one email to unsubscribe."
    serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c; padding: 16px;"
  }
})

document.querySelector("#close-modal").addEventListener("click", () => {
  modalOverlay.style.display = "none";
})