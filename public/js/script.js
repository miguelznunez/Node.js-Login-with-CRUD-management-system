const hamburger = document.querySelector(".hamburger"),
navMenu = document.querySelector(".nav-menu"),
windowLocation = window.location.pathname; 

// switch(windowLocation){      
//   case "/user-management/find-active-users":
//     const activeBack = document.querySelector(".back");
//     activeBack.innerHTML = '<a href="/user-management/active-users"><i class="fa-sharp fa-solid fa-arrow-left"></i></a>'
//     break;
//   case "/user-management/find-banned-users":
//     const bannedBack = document.querySelector(".back");
//     bannedBack.innerHTML = '<a href="/user-management/banned-users"><i class="fa-sharp fa-solid fa-arrow-left"></i></a>'
//     break;
//   case "/user-management/find-deleted-users":
//     const deletedBack = document.querySelector(".back");
//     deletedBack.innerHTML = '<a href="/user-management/deleted-users"><i class="fa-sharp fa-solid fa-arrow-left"></i></a>'
//     break;
// }

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
})

document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}))

window.addEventListener("scroll", () => {
	hamburger.classList.remove("active");
	navMenu.classList.remove("active");
})

// DROP DOWN MENU
document.addEventListener("click", e => {
  const isDropdownButton = e.target.matches("[data-dropdown-button]")
  if (!isDropdownButton && e.target.closest("[data-dropdown]") != null) return

  let currentDropdown
  if (isDropdownButton) {
    currentDropdown = e.target.closest("[data-dropdown]")
    currentDropdown.classList.toggle("active")
  }

  document.querySelectorAll("[data-dropdown].active").forEach(dropdown => {
    if (dropdown === currentDropdown) return
    dropdown.classList.remove("active")
  })
})