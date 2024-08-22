import OpenAI from 'openai'
import fs from 'fs'

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: 'sk-6zryfH7vUwlgMxaJQlpwFJpcxeLHRGK-CaD9PHhOHmT3BlbkFJOtCzWD6zLZFRKepP_w9Nmtp-wR_q4Kno1eUggK_UUA' })

let aapl10kId = null // Define a global variable to hold the file ID

async function main() {
   try {
      console.log("Creating assistant...")
      const assistant = await openai.beta.assistants.create({
         name: "Financial Analyst Assistant",
         instructions: "You are an expert financial analyst. Use your knowledge base to answer questions about audited financial statements.",
         model: "gpt-3.5-turbo",
         tools: [{ type: "file_search" }],
      })

      const filePaths = ["files/d638bbf3-ecdf-47fe-aca6-737b8003ee3a.docx"]
      const fileStreams = filePaths.map((path) => {
         if (fs.existsSync(path)) {
            console.log(`Reading file: ${path}`)
            return { file: fs.createReadStream(path), filename: path }
         } else {
            console.error(`File not found: ${path}`)
            return null
         }
      }).filter(file => file !== null)

      if (fileStreams.length === 0) {
         throw new Error("No files to upload.")
      }

      console.log("Creating vector store...")
      let vectorStore = await openai.beta.vectorStores.create({
         name: "Financial Statement",
      })

      console.log("Uploading files...")
      const fileIds = await Promise.all(
         fileStreams.map(async (fileStream) => {
            const file = await openai.files.create({
               file: fileStream.file,
               purpose: "assistants", // Corrected purpose
            })
            return file.id
         })
      )

      console.log("Creating and polling file batch...")
      await openai.beta.vectorStores.fileBatches.createAndPoll(vectorStore.id, {
         file_ids: fileIds
      })

      console.log("Updating assistant with vector store...")
      await openai.beta.assistants.update(assistant.id, {
         tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
      })

      console.log("Uploading additional file...")
      const aapl10k = await openai.files.create({
         file: fs.createReadStream("files/d638bbf3-ecdf-47fe-aca6-737b8003ee3a.docx"),
         purpose: "assistants",
      })

      aapl10kId = aapl10k.id // Store the file ID in the global variable

      console.log("Creating thread...")
      const thread = await openai.beta.threads.create({
         messages: [
            {
               role: "user",
               content:
                  "How many shares of AAPL were outstanding at the end of October 2023?",
               attachments: [{ file_id: aapl10kId, tools: [{ type: "file_search" }] }],
            },
         ],
      })

      console.log("Thread tool resources:", thread.tool_resources?.file_search)
   } catch (error) {
      console.error("Error:", error)
   }
}

async function testQuery() {
   try {
      if (!aapl10kId) {
         throw new Error("File ID not available. Please run the main function first.")
      }
      const query = "What is the revenue of the company for the last quarter?"
      const response = await openai.beta.threads.create({
         messages: [
            {
               role: "user",
               content: query,
               attachments: [{ file_id: aapl10kId, tools: [{ type: "file_search" }] }],
            },
         ],
      })

      console.log("Query Response:", response)
   } catch (error) {
      console.error("Error during query:", error)
   }
}

async function fetchThreadMessages(threadId) {
   try {
      const threadDetails = await openai.beta.threads.retrieve(threadId)
      console.log(`Thread ${threadId} Details:`, threadDetails)
   } catch (error) {
      console.error("Error fetching thread messages:", error)
   }
}

// Example: Call this function with the thread IDs
fetchThreadMessages('thread_Lll2aLAVSc2v0KNoAhSuOiwt') // Replace with your actual thread ID
fetchThreadMessages('thread_livEhQHq1eQ9hVRG92gE1PhK') // Replace with your actual thread ID

// Call this function after creating the thread
main().then(() => {
   testQuery().then(() => {
      fetchThreadMessages('thread_lt8eN7WH0Nov6byAFmGn7mJf') // Replace with actual thread ID
   })
})