// server.js (Node.js environment)
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors' // For handling CORS
import OpenAI from 'openai'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Express
const app = express()
app.use(bodyParser.json())
app.use(cors()) // Allow cross-origin requests

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: 'sk-6zryfH7vUwlgMxaJQlpwFJpcxeLHRGK-CaD9PHhOHmT3BlbkFJOtCzWD6zLZFRKepP_w9Nmtp-wR_q4Kno1eUggK_UUA' })

// Endpoint to handle chat messages
app.post('/send-message', async (req, res) => {
   try {
      const userMessage = req.body.message

      // Ensure message is provided
      if (!userMessage) {
         return res.status(400).json({ error: 'Message is required' })
      }

      // Call the OpenAI API or handle the message processing here
      const response = await openai.chat.completions.create({
         model: 'gpt-3.5-turbo',
         messages: [{ role: 'user', content: userMessage }]
      })

      // Send response back to the client
      res.json(response)
   } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Internal Server Error', details: error.message })
   }
})

// Start server
const port = process.env.PORT || 5500
app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`)
})