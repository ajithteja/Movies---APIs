const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

let dbPath = path.join(__dirname, "moviesData.db");

//console.log(dbPath);

let app = express();
app.use(express.json());

let db = null;

let initilizeDbToApp = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("Db Initilized");
  } catch (e) {
    console.log(`e.message`);
  }
};

initilizeDbToApp();

module.exports = app;

// GET MOVIE NAMES

app.get("/movies/", async (request, response) => {
  let dbQuery = await `
    SELECT movie_name
    FROM movie
    ORDER BY director_id;
    `;
  let dbOutput = await db.all(dbQuery);
  response.send(dbOutput);
});

// POST NEW MOVIE

app.post("/movies/", async (req, response) => {
  let newMovie = req.body;
  const { directorId, movieName, leadActor } = await newMovie;
  let dbInsertQuery = `
  INSERT INTO movie (director_id, movie_name, lead_actor)
VALUES ( ${directorId}, '${movieName}', '${leadActor}' );`;
  let dbInsertResponse = await db.run(dbInsertQuery);
  response.send("Movie Successfully Added");
});

// GET SINGLE MOVIE

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  let getQuery = await `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  let dbMovie = await db.get(getQuery);
  response.send(dbMovie);
});

// UPDATE SINGLE MOVIE

app.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let updatedData = await request.body;
  let { directorId, movieName, leadActor } = updatedData;

  let putQuery = await `UPDATE movie SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  let updatedMovie = db.run(putQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletQuery = await `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deletQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = await `SELECT * FROM Director 
    ORDER BY director_id;`;
  let directorDetails = await db.all(getDirectorQuery);
  response.send(directorDetails);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovieQurey = await `SELECT movie_name FROM movie
    WHERE director_id = ${directorId};`;
  let directorName = await db.all(directorMovieQurey);
  response.send(directorName);
});

app.listen(3000);
