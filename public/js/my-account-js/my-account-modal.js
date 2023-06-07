const modalOverlay = document.querySelector(".modal-overlay");

document.querySelector("#show-modal").addEventListener("click", () => {
  modalOverlay.style.display = "block";
})

document.querySelector("#close-modal").addEventListener("click", () => {
  modalOverlay.style.display = "none";
})