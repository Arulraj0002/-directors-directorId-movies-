const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const path = require('path')
db = null
const dbPath = path.join(__dirname, 'moviesData.db')
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at https://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Getting all movies names.
app.get('/movies/', async (request, response) => {
  const getAllMoviesQuery = `
    SELECT movie_name FROM movie;`
  const moviesNames = await db.all(getAllMoviesQuery)
  const convertDbObjectToResponseObject = dbObject => {
    return {
      movieName: dbObject.movie_name,
    }
  }
  response.send(
    moviesNames.map(eachMovie => convertDbObjectToResponseObject(eachMovie)),
  )
})

// creating new movie name
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
  INSERT INTO movie (director_id, movie_name, lead_actor)
  VALUES
  (${directorId},'${movieName}', '${leadActor}');`
  const dbResponse = await db.run(addMovieQuery)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})

// Return the movie based on movieId
app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT * from movie where movie_id=${movieId};`
  const moviedata = await db.get(getMovieQuery)
  const convertDbObjectToResponseObject = dbObject => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    }
  }
  response.send(convertDbObjectToResponseObject(moviedata))
})

// update the movie details based on movieId
app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateQuery = `
  UPDATE movie
  SET 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE movie_id=${movieId};`
  await db.run(updateQuery)
  response.send('Movie Details Updated')
})

// Deletes a movie from the movie table based on the movie ID
app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
    DELETE FROM movie WHERE movie_id=${movieId};`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

// Getting all directors names.
app.get('/director/', async (request, response) => {
  const getAllDirectorQuery = `
    SELECT * FROM director;`
  const directorsNames = await db.all(getAllDirectorQuery)
  response.send(directorsNames)
})

// Returns a list of all movie names directed by a specific director
app.get('directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `SELECT movie_name FROM movie
  WHERE director_id = ${directorId}`
  const movieArray = await db.all(getDirectorMoviesQuery)
  response.send(movieArray)
})
module.exports = app
