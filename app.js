const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

let db = null
const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')

const initializeServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is up and running')
    })
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`)
    process.exit(1)
  }
}

initializeServerAndDB()

//API-1
//get list of all todos
app.get('/todos/', async (request, response) => {
  const {status = '', priority = '', search_q = ''} = request.query
  const dbquery = `
  select * from todo
  where status like '%${status}%' and priority like '%${priority}%'
  and todo like '%${search_q}%';
  `
  const dbval = await db.all(dbquery)
  response.send(dbval)
})

//API-2
//get a todo with specified id
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const q = `
  select * from todo where id = ${todoId};
  `
  const val = await db.get(q)
  response.send(val)
})

//API-3
//create a todo in table
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const q = `
  insert into todo(id,todo,priority,status)
  values(${id},'${todo}','${priority}','${status}');
  `
  await db.run(q)
  response.send('Todo Successfully Added')
})

//API-4
//update a todo content
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {status = '', priority = '', todo = ''} = request.body
  let val = null
  let q = ''
  if (status == '' && priority == '') {
    q = `
    update todo 
    set todo = '${todo}'
     where id=${todoId};
    `
    val = 'Todo Updated'
  } else if (priority == '' && todo == '') {
    q = `
    update todo
     set status = '${status}' 
     where id=${todoId};
    `
    val = 'Status Updated'
  } else if (todo == '' && status == '') {
    q = `
    update todo
     set priority = '${priority}'
      where id=${todoId};
    `
    val = 'Priority Updated'
  }
  await db.run(q)
  response.send(val)
})

//API-5
//delete an row
app.delete('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const q = `
  delete from todo where id = ${todoId};
  `
  await db.run(q)
  response.send('Todo Deleted')
})

module.exports = app
