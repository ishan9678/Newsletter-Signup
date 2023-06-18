require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const client = require("@mailchimp/mailchimp_marketing");
const path = require("path");
const { log } = require("console");

const MAPI_KEY = process.env.API_KEY
const MLIST_ID = process.env.LIST_ID
const MAPI_SERVER = process.env.API_SERVER

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

client.setConfig({ apiKey: MAPI_KEY, server: MAPI_SERVER });

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/failure",(req,res)=>{
  res.redirect("/");
})

app.post("/", (req, res) => {
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.email;

  const subscribingUser = {
    firstName: firstName,
    lastName: lastName,
    email: email
  };

  const run = async () => {
    try {
      const response = await client.lists.addListMember(MLIST_ID, {
        email_address: subscribingUser.email,
        status: "subscribed",
        merge_fields: {
          FNAME: subscribingUser.firstName,
          LNAME: subscribingUser.lastName
        }
      });
      console.log("Subscriber successfully added", response);
      res.sendFile(__dirname + "/success.html");
    } catch (err) {
      console.log("Error adding subscriber", err);
      res.sendFile(__dirname + "/failure.html");
    }
  };

  run();
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
