const provideDatabase = require("./database.js");
const database = provideDatabase();
const bodyParser = require("body-parser");
const express = require("express");
const csv = require('fast-csv');
const fs = require("fs");
const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
      console.log("fertig geparsed");
    })
    .on("error", err => {
      console.log(err);
    });
  response.send("aight");
});


app.get("/tarife", async (request, response) => {
  const db = await database;
  const result = await db.all(
    "SELECT * FROM tarife WHERE zipCode = ?",
    request.query.zipCode
  );
  response.send(result);
});



app.get("/tarife/reset", async (request, response) => {
  const db = await database;
  const results = await db.all("DELETE FROM tarife");
  response.send("Daten gelöscht");
});

// Neue Bestellung anlegen
app.post('/orders', (req, res) => {
  console.log(req.body.firstName);
  res.send('OK');
});

// aktualisierung von ??? tarife, Orders, kunden etc
app.put('/orders', (req, res) => {
  
});

// Löschen von Daten
app.delete('/orders', (req, res) => {
  
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


//Kosten pro Jahr= Verbrauch pro Jahr (in KWh) * Variable Kosten (in €) + Fixkosten pro Jahr (in €)
app.post("/", async (req, res) => {
  // console.log(req.body.plz + " - " + req.body.verbrauch);
  const db = await database;
  const result = await db.all(
    "SELECT * FROM tarife WHERE zipCode = ?",
    req.body.plz
  );

  // console.log(req.body.plz + " - " + req.body.verbrauch);
  // console.log(result);
  result.forEach(elm => {
    //console.log(parseFloat(req.query.cons) * elm.varCosts * 12 + elm.fixCosts);
    let erg =
      parseFloat(req.body.verbrauch) * elm.varCosts * 12 + elm.fixCosts;
    elm.price = erg;
  });
  res.send(result);
  
});



app.listen(3000, (err) => {
  if(err) {
    console.log('etwas ist schiefgegeangen')
  }
  console.log('Server läuft auf: http://localhost:3000/')
});