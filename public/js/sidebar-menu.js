const sidebarHamburger = document.querySelector(".sidebar-hamburger"),
navBranding = document.querySelector(".nav-branding"),
sidebarMenu = document.querySelector(".sidebar-menu"),
content = document.querySelector(".content");

sidebarHamburger.addEventListener("click", () => {
  sidebarHamburger.classList.toggle("active")
  navBranding.classList.toggle("active")
  sidebarMenu.classList.toggle("active")
  content.classList.toggle("active")
})

const dropdown = document.querySelectorAll(".dropdown-btn");
let i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}