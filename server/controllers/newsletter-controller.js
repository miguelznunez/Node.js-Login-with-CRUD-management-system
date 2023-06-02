const express = require("express"),
db = require("../config/db-setup.js"),
{validationResult} = require("express-validator");

function get_date(){
    let yourDate = new Date()
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - (offset*60*1000));
    yourDate = yourDate.toISOString().split('T')[0]
    yourDate = yourDate.split("-")
    return `${yourDate[1]}-${yourDate[2]}-${yourDate[0]}` 
}

exports.searchSubscribers = (req, res) => {

  const searchTerm = req.body.search
  db.query("SELECT * FROM newsletter WHERE (email LIKE ?)", ["%" + searchTerm + "%"], (err, rows) => {
    if(!err) { 
      return res.status(200).render("subscribers", {title:"Newsletter - Subscribers" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("subscribers", {title:"Newsletter - Subscribers" , user:req.user, success:false, message:"Internal server error."})
    }
  })

}

exports.removeSubscribers = (req, res) => {

    const emails = JSON.parse(req.body.removeEmails)
    if(emails != ""){
        deleteEmailsFromDb(emails)
        req.flash("message", `The ${emails.length} selected email(s) have been successfully removed from your newsletter.`)
        return res.redirect("/newsletter-management/newsletter-views/subscribers") 
    } else {
        req.flash("message", `Please select at least one email.`)
        return res.redirect("/newsletter-management/newsletter-views/subscribers")
    }
}
  
exports.createSubscriber = (req, res) => {

    const errors = validationResult(req),
    allErrors = JSON.stringify(errors),
    allParsedErrors = JSON.parse(allErrors);
    if(!errors.isEmpty()){
      return res.status(401).json({statusMessage:allParsedErrors.errors[0].msg, status:401})
    }

    const nEmail = req.body.nEmail
    const date_subscribed = get_date();

     // CHECK IF THIS EMAIL EXISTS IN DB
     db.query("SELECT * FROM newsletter WHERE email = ?", [nEmail], (err, results) => {
        // IF IT DOESN'T: SAVE IT IN DB
        if(!err && results[0] === undefined){
            db.query("INSERT INTO newsletter (email, date_subscribed) VALUES (?,?)", [nEmail, date_subscribed], (err, results) => {
                if(!err){
                    return res.status(200).json({statusMessage:`${nEmail} has been successfully added to your newsletter!`, status:200})
                } else {
                    return res.status(500).json({statusMessage:"Internal Server Error", status:500})
                }
            })
        // IF IT DOES: LET THE USER KNOW
        } else if(!err && results != "") {
            return res.status(400).json({statusMessage:`${nEmail} is already subscribed.`, status:400})
        // DB ERROR
        } else {
            return res.status(500).json({statusMessage:"Internal Server Error", status:500})
        }

    })
}

exports.sendNewsletterEmail = (req, res) => {

    const {subject, emailTextarea} = req.body

    console.log(emailTextarea)
  
  }

function deleteEmailsFromDb(emails){
    for(let i = 0; i < emails.length;i++){
      db.query("DELETE FROM newsletter WHERE email = ?", [emails[i]], (err, result) => {
        if(err) throw new Error(err)
      })
    }
}

