const sidebarHamburger = document.querySelector(".sidebar-hamburger"),
sidebarMenu = document.querySelector(".sidebar-menu");

sidebarHamburger.addEventListener("click", () => {
  sidebarHamburger.classList.toggle("active")
  sidebarMenu.classList.toggle("active")
})