const express = require("express"),
db = require("../config/mysql-db-setup.js"),
mail = require("../config/nodemailer-email-setup.js"),
functions = require("../config/helper-functions.js"),
{validationResult} = require("express-validator");

exports.searchSubscribers = (req, res) => {

  const searchTerm = req.body.search
  db.query("SELECT * FROM newsletter WHERE (email LIKE ?)", ["%" + searchTerm + "%"], (err, result) => {
    if(!err) { 
      return res.status(200).render("subscribers", {title:"Newsletter - Subscribers" , user:req.user, result:result})
    } else { 
      return res.status(500).render("subscribers", {title:"Newsletter - Subscribers" , user:req.user, success:false, message:"Internal server error."})
    }
  })

}

exports.removeSubscribers = (req, res) => {

  const emails = JSON.parse(req.body.removeEmails)
  deleteEmailsFromDb(emails, (err, result) => {
    if(!err){
      req.flash("message", `The ${emails.length} selected email(s) have been successfully removed from your newsletter.`)
      return res.redirect("/newsletter-management/newsletter-views/view-subscribers")
    } else {
      req.flash("message", "Internal server error")
      return res.redirect("/newsletter-management/newsletter-views/view-subscribers")
    }
  })
}
  
exports.addSubscriber = (req, res) => {

    const errors = validationResult(req),
    allErrors = JSON.stringify(errors),
    allParsedErrors = JSON.parse(allErrors);
    if(!errors.isEmpty()){
      return res.status(401).json({statusMessage:allParsedErrors.errors[0].msg, status:401})
    }

    const email = req.body.nEmail

     // CHECK IF THIS EMAIL EXISTS IN DB
     db.query("SELECT * FROM newsletter WHERE email = ?", [email], (err, result) => {
        // IF IT DOESN'T: SAVE IT IN DB
        if(!err && result[0] === undefined){
            db.query("INSERT INTO newsletter (email, date_subscribed) VALUES (?,?)", [email, functions.getDate()], (err, result) => {
              if(!err){
                // mail.newsletterWelcomeEmail(email, (err, info) => {
                //   if(!err) {
                //       return res.status(200).json({statusMessage:`${email} has been successfully added to your newsletter!`, status:200})
                //   } else { 
                //     return res.status(500).json({statusMessage:"Internal Server Error", status:500})
                //   }
                // });
                // ONLY USING THIS SO I WONT SEND AN EMAIL EVERYTIME
                return res.status(200).json({statusMessage:`${email} has been successfully added to your newsletter!`, status:200})
              } else {
                  return res.status(500).json({statusMessage:"Internal Server Error", status:500})
              }
            })
        // IF IT DOES: LET THE USER KNOW
        } else if(!err && result != "") {
            return res.status(400).json({statusMessage:`${email} is already subscribed.`, status:400})
        // DB ERROR
        } else {
            return res.status(500).json({statusMessage:"Internal Server Error", status:500})
        }

    })
}

exports.sendNewsletterEmail = (req, res) => {

    const {subject, message} = req.body

    db.query("SELECT email FROM newsletter", (err, result) => {  
      if(!err){
        const emails = []
        result.forEach(e => {
          emails.push(e.email)
        });
        mail.newsletterEmail(subject, message, emails, (err, info) => {
          if(!err){
            return res.status(200).json({statusMessage:"Your message has been successfully sent to your newsletter subscribers!", status:200})
          } else {
            return res.status(500).json({statusMessage:"Internal Server Error", status:500})
          }
        })
      } else {
        return res.status(500).json({statusMessage:"Internal Server Error", status:500})
      }
    })
  
  }

function deleteEmailsFromDb(emails, callback){
  db.query("DELETE FROM newsletter WHERE email IN (?)", [emails], (err, result) => {
    if(err) callback(err, null)
    else callback(null, result)
  })
}

