const database = require("./database.js");
const bodyParser = require("body-parser");
const express = require("express");
const csv = require('fast-csv');
const fs = require("fs");
const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));


app.get("/", (req, res) => {
  console.log('Läuft')
  res.sendFile(__dirname + "/views/index.html");
}); 


let csvStream = csv.parseFile("./tarifdaten.csv", {headers: true, delimiter: ';'})
  .on("data", (record) => {
    csvStream.pause();

    let Tarifname = record.Tarifname;
    let PLZ = record.PLZ;
    let Fixkosten = record.Fixkosten;
    let VariableKosten = record.VariableKosten;

    console.log('Tarifname: ' + Tarifname + ', PLZ: ' + PLZ);
    

  csvStream.resume()
  }).on("end", () => {
    console.log("fertig parsed");
  }).on("error", (err) => {
    console.log(err);
  })

  


app.listen(3000, (err) => {
  if(err) {
    console.log('etwas ist schiefgegeangen')
  }
  console.log('Server läuft auf Port 3000')
});