import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";


const app = express();
const port = 3000;
env.config();


const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

db.connect();

//Apagar base de dados
// db.query("DELETE FROM visited_countries;");

async function checkVisisted(){
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) =>{
    countries.push(country.country_code);
  });
  return countries;
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs", {countries: countries, total: countries.length });
});

app.post("/add", async(req, res) => {
  const input = req.body["country"];
  const result = await db.query( 
    "SELECT country_code FROM countries WHERE  country_name = $1",
    [input]
  );

  if (result.rows.length !== 0){
    const data = result.rows[0];
    const countryCode = data.country_code;
    await db.query("INSERT INTO visited_countries (country_code) VALUES($1)", [
      countryCode,
    ]);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
