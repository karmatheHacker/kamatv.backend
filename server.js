const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

const app = express()
const PORT = 8000

// Middleware
app.use(cors())
app.use(express.json())

const usersFilePath = path.join(__dirname, "users.json")

// GET /users - Get all users
app.get("/users", (req, res) => {
  try {
    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"))
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: "Failed to read users" })
  }
})

// POST /already - Check if user exists and validate password
app.post("/already", (req, res) => {
  const { name, password } = req.body

  if (!name || !password) {
    return res.status(400).json({ error: "Name and password required" })
  }

  try {
    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"))

    if (name in users) {
      if (users[name].password === password) {
        // User exists and password matches
        res.status(200).json({
          status: "success",
          user: {
            name: users[name].name,
            created_on: users[name].Created_on,
          },
        })
      } else {
        // User exists but password doesn't match
        res.status(401).json({ error: "Invalid password" })
      }
    } else {
      // User doesn't exist
      res.status(404).json({ error: "User not found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" })
  }
})

// POST /users - Create new user
app.post("/users", (req, res) => {
  const { name, password } = req.body

  if (!name || !password) {
    return res.status(400).json({ error: "Name and password required" })
  }

  try {
    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"))
    const date = new Date()

    // Check if user already exists
    if (name in users) {
      return res.status(409).json({ error: "User already exists" })
    }

    users[name] = {
      name,
      password,
      Created_on: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
    }

    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))

    res.status(201).json({ status: "success" })
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
