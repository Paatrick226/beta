const provideDatabase = require("./database.js");
const database = provideDatabase();
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

// Einlesen CSV Datei und speichern
app.get("/tarife/input", async (request, response) => {
  let csvStream = csv
    .parseFile("./tarifdaten.csv", { headers: true, delimiter: ";" })
    .on("data", async record => {
      csvStream.pause();

      let Tarifname = record.Tarifname;
      let PLZ = record.PLZ;
      let Fixkosten = parseFloat(record.Fixkosten.replace(",", "."));
      let VariableKosten = parseFloat(record.VariableKosten.replace(",", "."));

      const db = await database;
      const created = await db.run(
        "INSERT INTO tarife (name, zipCode, fixCosts, varCosts) VALUES (?, ?, ?, ?)",
        Tarifname,
        PLZ,
        Fixkosten,
        VariableKosten
      );

      // console.log('Tarifname: ' + Tarifname + ', PLZ: ' + PLZ);

      csvStream.resume();
    })
    .on("end", () => {
      console.log("fertig parsed");
    })
    .on("error", err => {
      console.log(err);
    });
  response.redirect("/tarife");
});


app.get("/tarife", async (request, response) => {
  const db = await database;
  const result = await db.get(
    "SELECT * FROM tarife WHERE zipCode = ?",
    request.query.zipCode
  );
  response.send(result);
});

/*
app.get(
  "/rates/zipCode=:zip&consumption=:consumption",
  async (request, response) => {
    let zipCode = request.params.zip;
    let consumption = request.params.consumption;
    const db = await database;
    const result = await db.get(
      "SELECT name,  FROM tarife WHERE zipCode = ?",
      request.params.zip
    );
    response.send(zipCode);
  }
);
*/
app.get("/tarife/reset", async (request, response) => {
  const db = await database;
  const results = await db.all("DELETE FROM tarife");
  response.send("Daten gelöscht");
});

app.get("/tarife/:id", async (request, response) => {
  const db = await database;
  const tarif = await db.get(
    "SELECT * FROM tarife WHERE id = ?",
    request.params.id
  );
  if (tarif == null) {
    response.status(403).send({ error: "Page not found!" });
  } else {
    response.send(tarif);
  }
});






app.listen(3000, (err) => {
  if(err) {
    console.log('etwas ist schiefgegeangen')
  }
  console.log('Server läuft auf: http://localhost:3000/')
});