const express = require("express"),
db = require("../config/mysql-db-setup.js"),
mail = require("../config/nodemailer-email-setup.js"),
functions = require("../config/helper-functions.js"),
{validationResult} = require("express-validator");

exports.newsletterForm = (req, res) => {

    const errors = validationResult(req),
    allErrors = JSON.stringify(errors),
    allParsedErrors = JSON.parse(allErrors);
    if(!errors.isEmpty()){
        res.statusMessage = allParsedErrors.errors[0].msg
        return res.status(401).end()
    }

    const email = req.body.email

    // CHECK IF THIS EMAIL EXISTS IN DB
    db.query("SELECT * FROM newsletter WHERE email = ?", [email], (err, result) => {
        // IF IT DOESN'T: SAVE IT IN DB
        if(!err && result[0] === undefined){
            db.query("INSERT INTO newsletter (email, date_subscribed) VALUES (?,?)", [email, functions.getDate()], (err, result) => {
                if(!err){
                    // mail.newsletterWelcomeEmail(email, (err, info) => {
                    //     if(!err) {
                    //         return res.status(200).json({statusMessage:"Thanks for subscribing!", status:200})
                    //     } else { 
                    //       return res.status(500).json({statusMessage:"Internal Server Error", status:500})
                    //     }
                    //   });
                    // ONLY USING THIS SO I WONT SEND AN EMAIL EVERYTIME
                    return res.status(200).json({statusMessage:"Thanks for subscribing!", status:200})
                } else {
                    return res.status(500).json({statusMessage:"Internal Server Error", status:500})
                }
            })
        // IF IT DOES: LET THE USER KNOW
        } else if(!err && result != "") {
            return res.status(400).json({statusMessage:`${email} is already subscribed.`, status:400})
        // DB ERROR
        } else {
            return res.status(500).json({statusText:"Internal Server Error", status:500})
        }

    })
}

exports.addToCartForm = (req, res) => {
    const {id, name, brand, category, sku, price, sale_price, quantity, image} = req.body
    const product = {id:id, name:name, brand:brand, category:category, sku:sku, price:price, sale_price:sale_price, quantity:quantity, image:image}

    if(req.session.cart){
        var cart = req.session.cart
        if(!functions.isProductInCart(cart, id)){
            cart.push(product)
        }
    } else {
        req.session.cart = [product]
        var cart = req.session.cart
    }

    // Calculate total
    functions.calculateTotal(cart, req)

    // return to cart page
    return res.status(200).redirect("/cart")
}

exports.removeProduct = (req, res) => {

    const id = req.body.id
    let cart = req.session.cart

    for(let i = 0;i < cart.length;i++){
        if(cart[i].id == id){
            cart.splice(cart.indexOf(i), 1)
        }
    }
    
    // re-calculate
    functions.calculateTotal(cart, req)
    res.redirect("/cart")

}