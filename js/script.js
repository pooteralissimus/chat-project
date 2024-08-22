document.addEventListener("DOMContentLoaded", function () {
   const chatContainer = document.querySelector('.chat-container')
   const collapseButton = document.querySelector('.collapse-button')
   const chatHeader = document.querySelector('.chat-header')
   const chatInputForm = document.querySelector('.chat-input-form')
   const chatOptions = document.querySelector('.chat-options')
   const chatBody = document.querySelector('.chat-body')
   const chatInput = document.querySelector('.chat-input')
   const userMessages = document.querySelector('.user-messages')
   const chatBackButton = document.querySelector('.chat-back')
   const buttonConsultant = document.querySelector('#button-consultant')
   const chatConsultation = document.querySelector('.chat-consultation')

   const hiddenElements = [
      ...document.querySelectorAll('.chat-consultation .chat-header-title-logo, .chat-header-right-actions, .chat-date, .message-assistant-logo-after, .message-assistant-small, .options-icon')
   ]

   // Hide elements initially
   hiddenElements.forEach(element => {
      element.classList.add('hidden')
   })

   // Ensure chat-consultation is hidden initially
   chatConsultation.classList.add('hidden')

   function displayMessage(text, isRight) {
      const messageDiv = document.createElement('div')
      messageDiv.classList.add('text', 'message')
      if (isRight) {
         messageDiv.classList.add('message-right')
         chatBody.appendChild(messageDiv)
      } else {
         messageDiv.classList.add('message-left')
         chatBody.appendChild(messageDiv)
      }
      messageDiv.textContent = text
      chatBody.scrollTop = chatBody.scrollHeight
   }

   function saveMessageToHistory(text, isRight) {
      const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || []
      chatHistory.push({ text, isRight })
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
   }

   chatInputForm.addEventListener('submit', async function (e) {
      e.preventDefault()
      const userInput = chatInput.value.tr()
      if (userInput) {
         displayMessage(userInput, true)
         saveMessageToHistory(userInput, true)
         chatInput.value = ''

         // Send message to server
         try {
            const response = await fetch('http://localhost:5500/send-message', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ message: userInput })
            })

            // Check if response is ok
            if (!response.ok) {
               throw new Error('Network response was not ok')
            }

            const data = await response.json()

            // Display assistant's response
            if (data.choices && data.choices.length > 0) {
               const assistantMessage = data.choices[0].message.content
               displayMessage(assistantMessage, false)
            } else {
               console.error('Unexpected response format:', data)
            }
         } catch (error) {
            console.error('Error during fetch:', error)
         }
      }
   })

   function toggleChatCollapse() {
      chatContainer.classList.toggle('chat-container-collapsed')
      chatHeader.classList.toggle('chat-header-collapsed')
      chatInputForm.classList.toggle('chat-input-form-collapsed')
      const isCollapsed = chatContainer.classList.contains('chat-container-collapsed')
      collapseButton.querySelector('img').src = isCollapsed ? 'images/icons/arrow-down.svg' : 'images/icons/chat-icon.svg'
   }

   collapseButton.addEventListener('click', toggleChatCollapse)
   chatBackButton.addEventListener('click', toggleChatCollapse)

   buttonConsultant.addEventListener('click', function () {
      // Clear all child elements from chatOptions before appending a new message
      while (chatOptions.firstChild) {
         chatOptions.removeChild(chatOptions.firstChild)
      }

      // Display user's message
      const consultantMessage = document.createElement('div')
      consultantMessage.classList.add('text', 'message', 'message-right', 'user-message-after')
      consultantMessage.textContent = "I would like to chat with a consultant"
      userMessages.appendChild(consultantMessage)

      // Show hidden elements
      hiddenElements.forEach(element => {
         element.classList.remove('hidden')
      })

      document.querySelector('.chat-title-paragraph').classList.add('hidden')
      document.querySelector('.message-assistant-logo-initial').classList.add('hidden')
      document.querySelector('#diversified').classList.add('hidden')
      document.querySelector('.chat-title-title').classList.add('chat-title-title-after')
      chatBackButton.classList.add('hidden')
      document.querySelector('.message-assistant').classList.add('message-assistant-after')

      // Add assistant's message after a random delay between 1 and 2 seconds
      setTimeout(() => {
         const assistantMessage = document.createElement('div')
         assistantMessage.classList.add('message-assistant-container')
         assistantMessage.innerHTML = `
            <div class="message-assistant-container">
            <div class="message message-assistant message-left message-assistant-after">
               <div class="message-assistant-logo message-assistant-logo-after">
                  <img src="images/icons/logo-white.png" alt="Consultants Logo" class="message-logo">
               </div>
               <div class="message-assistant-logo message-assistant-logo-initial hidden">
                  <img src="images/icons/logo.png" alt="Consultants Logo" class="message-logo">
               </div>
               <div class="message-assistant-info">
                  <span id="diversified" class="hidden">Diversified Nurse Consultants</span>
                  <p class="message-assistant-text text">Would you like to schedule a paid consultation with one of our experts to get more in-depth assistance?</p>
               </div>
            </div>
            <div class="message-assistant-small small-text">
               Bot · <span id="message-time">1h</span> ago
            </div>
         </div>`

         chatBody.appendChild(assistantMessage)
         chatBody.scrollTop = chatBody.scrollHeight

         // Replace chat-input-form with chat-consultation after assistant's message appears
         chatConsultation.classList.remove('hidden')
         chatInputForm.classList.add('hidden')
      }, Math.random() * 1000 + 1000) // Random delay between 1 and 2 seconds

      chatContainer.classList.add('chat-container-after')
      chatHeader.classList.add('chat-header-after')
   })

   setTimeout(() => {
      localStorage.removeItem('chatHistory')
   }, 2 * 60 * 60 * 1000)
});

/*
1. Press button "Chat with consultant"
2. Change styles:
   a) Header - completely change layout
   b) Change the color of background and messages
   c) Add 'Today'
   d) Chatbot messages layout (other logo)
   e) first message from bot - diversified... disappears
   f) user's messages are green with white font
   d) make other option buttons disappear
3. Would you like to schedule a paid consultation with one of our experts to get more in-depth assistance?
4. In footer - Click here to book your session and get the personalized help you need and add button to redirect (link)


*/