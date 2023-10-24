const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server is Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertMovieName = (each) => {
  return {
    movieName: each.movie_name,
  };
};

const convertObject = (each) => {
  return {
    directorId: each.director_id,
    movieName: each.movie_name,
    leadActor: each.lead_actor,
  };
};

const convertDirectorName = (each) => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const moviesQuery = `
        SELECT movie_name
        FROM movie;`;
  const movieArray = await database.all(moviesQuery);
  response.send(movieArray.map((eachMovie) => convertMovieName(eachMovie)));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovie = `
        INSERT INTO 
           movie (director_id, movie_name, lead_actor)
           VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  const newMovie = await database.run(postMovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const movieId = request.params;
  const getMovieQuery = `
        SELECT *
        FROM movie
        WHERE movie_id = '${movieId}';`;
  const movieArray = await database.get(getMovieQuery);
  response.send(convertObject(movieArray));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovie = `
        UPDATE movie
        SET 
          director_id = '${directorId}',
          movie_name = ${movieName}
          lead_actor = ${leadActor}
        WHERE movie_id = '${movieId}';`;
  await database.run(updateMovie);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = '${movieId}';`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directorQuery = `
        SELECT *
        FROM director;`;
  const directorArray = await database.all(directorQuery);
  response.send(
    directorArray.map((eachMovie) => convertDirectorName(eachMovie))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorName = `
        SELECT movie_name
        FROM movie
        WHERE director_id = '${directorId}';`;
  const directorArray = await database.all(directorName);
  response.send(directorArray.map((eachMovie) => convertMovieName(eachMovie)));
});

module.exports = app;
