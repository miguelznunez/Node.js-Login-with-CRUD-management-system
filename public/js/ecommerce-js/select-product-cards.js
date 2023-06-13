const productCard = document.querySelectorAll(".product-card"),
checkBox = document.querySelectorAll(".product-box"),
editController = document.querySelector(".edit-controller"),
deleteController = document.querySelector(".delete-controller"),
editProductBtn = document.querySelector("#edit-product-btn"),
cancelProductBtn = document.querySelector("#cancel-product-btn"),
selectProductsBtn = document.querySelector("#select-all-product-btn"),
deselectProductsBtn = document.querySelector("#deselect-all-product-btn"),
serverMessage = document.querySelector(".server-message");
let removeProducts = []
let pcHandlers = []
let cbHandlers = []

// FUNCTION TO SELECT A PRODUCT CARD BY CLICKING THE CARD

var productCardEvent = function(index) {
    if(checkBox[index].checked === false) {
        checkBox[index].checked = true
        productCard[index].style.opacity = 1
        productCard[index].style.boxShadow = "0 2px 7px #343a40"
        let object = { Key:checkBox[index].value }
        removeProducts.push(object)
    } else {
        checkBox[index].checked = false
        productCard[index].style.opacity = 0.5
        productCard[index].style.boxShadow = "0 2px 7px #dfdfdf"
        const productToBeRemoved = { Key:checkBox[index].value}
        removeProducts.splice(removeProducts.findIndex(i => i.Key === productToBeRemoved.Key), 1)
    }
    document.querySelector('[name="removeProducts"]').value = JSON.stringify(removeProducts)
}

// FUNCTION TO SELECT A PRODUCT CARD BY CLICKING THE CHECKBOX 

var checkBoxEvent = function(index){
    if(checkBox[index].checked === false) {
        checkBox[index].checked = true
        productCard[index].style.opacity = 1
        productCard[index].style.boxShadow = "0 2px 7px #343a40"
        let object = { Key:checkBox[index].value }
        removeProducts.push(object)
    } else {
        checkBox[index].checked = false
        productCard[index].style.opacity = 0.5
        productCard[index].style.boxShadow = "0 2px 7px #dfdfdf"
        const productToBeRemoved = { Key:checkBox[index].value}
        removeProducts.splice(removeProducts.findIndex(i => i.Key === productToBeRemoved.Key), 1)
    }
    document.querySelector('[name="removeProducts"]').value = JSON.stringify(removeProducts)
}

// EDIT PRODUCT BUTTON 

editProductBtn.addEventListener("click", () => {
    editController.style.display = "none";
    deleteController.style.display = "block";

    productCard.forEach((pc, i) => {
        pc.style.opacity = 0.5
        pc.style.cursor = "pointer"
        const wrappedFunc = productCardEvent.bind(this, i)
        pcHandlers.push(wrappedFunc)
        pc.addEventListener("click", wrappedFunc)
    })

    checkBox.forEach((cb, i) => {
        cb.style.visibility = "visible"
        const wrappedFunc = checkBoxEvent.bind(this, i)
        cbHandlers.push(wrappedFunc)
        cb.addEventListener("click", wrappedFunc)
    })

})

// CANCEL PRODUCT BUTTON

cancelProductBtn.addEventListener("click", () => {
    editController.style.display = "block";
    deleteController.style.display = "none";

    productCard.forEach((pc, i) => {
        pc.style.opacity = 1
        pc.style.cursor = "auto"
        pc.style.boxShadow = "0 2px 7px #dfdfdf"
        pc.removeEventListener("click", pcHandlers[i])
    })

    checkBox.forEach((cb, i) => {
        cb.checked = false
        cb.style.visibility = "hidden"
        cb.removeEventListener("click", cbHandlers[i])
    })

    deselectProductsBtn.style.display = "none"
    selectProductsBtn.style.display = "block"

    removeProducts = []
    pcHandlers = []
    cbHandlers = []

})

// SELECT PRODUCTS BUTTON 

selectProductsBtn.addEventListener("click", () => {
    removeProducts = []
    checkBox.forEach((cb, i) => {
        cb.checked = true;
        productCard[i].style.opacity = 1
        productCard[i].style.boxShadow = "0 2px 7px #343a40"
        let object = { Key:checkBox[i].value }
        removeProducts.push(object)
    })       
    document.querySelector('[name="removeProducts"]').value = JSON.stringify(removeProducts)
    deselectProductsBtn.style.display = "block"
    selectProductsBtn.style.display = "none"
})

// DESELECT PRODUCTS BUTTON 

deselectProductsBtn.addEventListener("click", () => {
    removeProducts = []
    checkBox.forEach((cb, i) => {
        cb.checked = false;
        productCard[i].style.opacity = 0.5
        productCard[i].style.boxShadow = "0 2px 7px #dfdfdf"
    })       
    document.querySelector('[name="removeProducts"]').value = JSON.stringify(removeProducts)
    deselectProductsBtn.style.display = "none"
    selectProductsBtn.style.display = "block"
})