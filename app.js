const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2");
const app = express();
require('dotenv').config();

const homeRoutes = require("./routes/index.routes");
const playerRoutes = require('./routes/player.routes')

//connect to database
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.connect((err)=>{
  if(err){
    throw err;
  }
  console.log('Connected to database');
  
})


global.db = db;

//Configure middleware
 
app.set("views", __dirname + "/views"); //set express to look in this folder
app.set("view engine", "ejs"); //configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); //configure express to use public folder
app.use(fileUpload()); //configuer file upload

//Route for the app
app.use("/", homeRoutes);
app.use('/player',playerRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
