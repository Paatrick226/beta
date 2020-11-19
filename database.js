const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const fs = require("fs");


async function provideDatabase() {
  const databaseExists = fs.existsSync("./.data/database.db");
  const db = await sqlite.open({
    filename: "./.data/database.db",
    driver: sqlite3.Database
  });
  if (!databaseExists) {
    await db.exec(
      "CREATE TABLE tarife (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR, zipCode INTEGER, fixCosts INTEGER, varCosts INTEGER)"
    );
    await db.exec(
      "CREATE TABLE order (id INTEGER PRIMARY KEY AUTOINCREMENT, tarifID INTEGER, agentID INTEGER, customerID INTEGER, consumption INTEGER, price INTEGER)"
    );
    await db.exec(
      "CREATE TABLE agent (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR, provision INTEGER)"
    );
    await db.exec(
      "CREATE TABLE customer (id INTEGER PRIMARY KEY AUTOINCREMENT, agendID INTEGER, firstname VARCHAR, lastname VARCHAR, street VARCHAR, streetNumber INTEGER, city VARCHAR)"
    );
  }
  return db;
}

module.exports = provideDatabase;