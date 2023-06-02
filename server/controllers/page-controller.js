const express = require("express"),
db = require("../config/db-setup.js"),
mail = require("../config/mail-setup.js"),
{validationResult} = require("express-validator");

function get_date(){
    let yourDate = new Date()
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - (offset*60*1000));
    yourDate = yourDate.toISOString().split('T')[0]
    yourDate = yourDate.split("-")
    return `${yourDate[1]}-${yourDate[2]}-${yourDate[0]}` 
}

exports.newsletterForm = (req, res) => {

    const errors = validationResult(req),
    allErrors = JSON.stringify(errors),
    allParsedErrors = JSON.parse(allErrors);
    if(!errors.isEmpty()){
        res.statusMessage = allParsedErrors.errors[0].msg
        return res.status(401).end()
    }

    const email = req.body.email
    const date_subscribed = get_date();

    // CHECK IF THIS EMAIL EXISTS IN DB
    db.query("SELECT * FROM newsletter WHERE email = ?", [email], (err, results) => {
        // IF IT DOESN'T: SAVE IT IN DB
        if(!err && results[0] === undefined){
            db.query("INSERT INTO newsletter (email, date_subscribed) VALUES (?,?)", [email, date_subscribed], (err, results) => {
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
        } else if(!err && results != "") {
            return res.status(400).json({statusMessage:`${email} is already subscribed.`, status:400})
        // DB ERROR
        } else {
            return res.status(500).json({statusText:"Internal Server Error", status:500})
        }

    })
}