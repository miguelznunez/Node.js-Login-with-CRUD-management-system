const db = require("../config/mysql-db-setup.js")

const checkBrowser = (headers) => {
    var ba = ["Chrome","Firefox","Safari","Opera","MSIE","Trident", "Edge"];
    var b, ua = headers['user-agent'];
    for(var i=0; i < ba.length;i++){
      if(ua.indexOf(ba[i]) > -1){
        b = ba[i];
        break;
      }
    }
    // IF INTERNET EXPLORER IS BEING USED RETURN TRUE OTHERWISE RETURN FALSE
    if(b === "MSIE" || b === "Trident") return true;
    else return false
}

const getDate = () => {
    let yourDate = new Date()
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - (offset*60*1000));
    yourDate = yourDate.toISOString().split('T')[0]
    yourDate = yourDate.split("-")
    return `${yourDate[1]}/${yourDate[2]}/${yourDate[0]}` 
}

const isProductInCart = (cart, id) => {
  for(let i = 0; i < cart.length; i++){
      if(cart[i].id == id){
          return true
      }
  }
  return false
}

const calculateTotal = (cart, req) => {
  let total = 0

  for(let i = 0;i < cart.length;i++){
      if(cart[i].sale_price){
          total += cart[i].sale_price * cart[i].quantity
      } else {
          total += cart[i].price * cart[i].quantity
      }
  }
  req.session.total = total
  return total
  
}

const saveProductInDB = (data, image, callback) => {
  const {name, brand, description, price, sale_price, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL} = data

  if(sale_price == "" || sale_price == 0){
    db.query("INSERT INTO products (name, brand, description, price, sale_price, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL, created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [name, brand, description, price, null, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL, getDate()], (err, result) => {
      if(err) callback(err, null)
      else callback(null, result)
    })
  } else {
    db.query("INSERT INTO products (name, brand, description, price, sale_price, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL, created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [name, brand, description, price, sale_price, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL, getDate()], (err, result) => {
      if(err) callback(err, null)
      else callback(null, result)
    })
  }
}

const editProductInfoInDB = (data, callback) => {
  const {id, name, brand, description, price, sale_price, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL} = data
  if(sale_price == "" || sale_price == 0){
    db.query("UPDATE products SET name = ?, brand = ?, description = ?, price = ?, sale_price = ?, image = ?, category = ?, gender = ?, sku = ?, quantity = ?, quantity_XS = ?, quantity_S = ?, quantity_M = ?, quantity_L = ?, quantity_XL = ?, quantity_XXL = ? WHERE id = ?", [name, brand, description, price, null, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL, id], (err, result) => {
      if(err) callback(err, null)
      else callback(null, result)
    })
  } else {
    db.query("UPDATE products SET name = ?, brand = ?, description = ?, price = ?, sale_price = ?, image = ?, category = ?, gender = ?, sku = ?, quantity = ?, quantity_XS = ?, quantity_S = ?, quantity_M = ?, quantity_L = ?, quantity_XL = ?, quantity_XXL = ? WHERE id = ?", [name, brand, description, price, sale_price, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL, id], (err, result) => {
      if(err) callback(err, null)
      else callback(null, result)
    })
  } 
}

const editProductInfoImageInDB = (data, image, callback) => {
  const {id, name, brand, description, price, sale_price, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL} = data
  if(sale_price == "" || sale_price == 0){
    db.query("UPDATE products SET name = ?, brand = ?, description = ?, price = ?, sale_price = ?, image = ?, category = ?, gender = ?, sku = ?, quantity = ?, quantity_XS = ?, quantity_S = ?, quantity_M = ?, quantity_L = ?, quantity_XL = ?, quantity_XXL = ? WHERE id = ?", [name, brand, description, price, null, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL, id], (err, result) => {
      if(err) callback(err, null)
      else callback(null, result)
    })
  } else {
    db.query("UPDATE products SET name = ?, brand = ?, description = ?, price = ?, sale_price = ?, image = ?, category = ?, gender = ?, sku = ?, quantity = ?, quantity_XS = ?, quantity_S = ?, quantity_M = ?, quantity_L = ?, quantity_XL = ?, quantity_XXL = ? WHERE id = ?", [name, brand, description, price, sale_price, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL, id], (err, result) => {
      if(err) callback(err, null)
      else callback(null, result)
    })
  }
}

const deleteProductsFromDb = (images, callback) => {
  db.query("DELETE FROM products WHERE image IN (?)", [images], (err, result) => {
    if(err) callback(err, null)
    else callback(null, result)
  })
}

const deleteEmailsFromDb = (emails, callback) => {
  db.query("DELETE FROM newsletter WHERE email IN (?)", [emails], (err, result) => {
    if(err) callback(err, null)
    else callback(null, result)
  })
}

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array
}

module.exports = { checkBrowser, getDate, isProductInCart, calculateTotal, saveProductInDB, editProductInfoInDB, editProductInfoImageInDB, deleteProductsFromDb, deleteEmailsFromDb, shuffleArray }