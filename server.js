require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const POKEDEX = require('./pokedex.json')
const app = express()

// app.use(morgan('dev'))
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())


const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

// -------- validation middleware 
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN
  const authToken = req.get('Authorization')

  if (!authToken || authToken.split(' ')[1] !== apiToken)
  {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  console.log('validate bearer token middleware')
  // move to the next middleware
  next()
})

// -------- end point /types
function handleGetTypes(req, res) {
  res.json(validTypes)
}
app.get('/types', handleGetTypes)

// -------- end point /pokemon
function handleGetPokemon(req, res) {
  const { name = "", type = "" } = req.query;
  // search for name
  let response = POKEDEX.pokemon;

  // filter our pokemon by name if name query param is present
  if (name)
  {
    response = response.filter(item =>
      item.name.toLowerCase().includes(name.toLowerCase())
    )
  }

  if (type)
  {
    // type is parameters are case sensitive.
    response = response.filter(item =>
      // item.type.includes(type.toLowerCase())
      item.type.includes(type)
    )
  }

  res.send(response);
}
app.get('/pokemon', handleGetPokemon)

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production')
  {
    response = { error: { message: 'server error' } }
  } else
  {
    response = { error }
  }
  res.status(500).json(response)
})


const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})

/* for local test use.
http://localhost:8000/pokemon?type=Grass
http://localhost:8000/pokemon?type=Grass&name=Ivysaur
http://localhost:8000/pokemon?name=Ivysaur
http://localhost:8000/pokemon?name=Venusaur
*/
