
/* =====================================================
   1. MOBILE NAVIGATION
===================================================== */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {

        navLinks.classList.toggle("active");

    });

}


/* =====================================================
   2. CLOSE MOBILE MENU AFTER CLICKING NAVIGATION LINK
===================================================== */

const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach(function (item) {

    item.addEventListener("click", function () {

        if (navLinks) {
            navLinks.classList.remove("active");
        }

    });

});


/* =====================================================
   3. ACTIVE NAVIGATION LINK ON SCROLL
===================================================== */

const sections = document.querySelectorAll("section");

window.addEventListener("scroll", function () {

    let currentSection = "";

    sections.forEach(function (section) {

        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop - 150) {

            currentSection = section.getAttribute("id");

        }

    });

    navItems.forEach(function (link) {

        link.classList.remove("active-link");

        if (link.getAttribute("href") === "#" + currentSection) {

            link.classList.add("active-link");

        }

    });

});


/* =====================================================
   4. SCROLL REVEAL ANIMATION
===================================================== */

const revealElements = document.querySelectorAll(
    ".section, .project-card, .skill-card, .experience-card"
);

revealElements.forEach(function (element) {

    element.classList.add("reveal");

});

const observer = new IntersectionObserver(

    function (entries) {

        entries.forEach(function (entry) {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                observer.unobserve(entry.target);

            }

        });

    },

    {
        threshold: 0.15
    }

);

revealElements.forEach(function (element) {

    observer.observe(element);

});


/* =====================================================
   5. CHATBOT HTML ELEMENTS
===================================================== */

const chatbotToggle = document.getElementById("chatbotToggle");

const chatbotClose = document.getElementById("chatbotClose");

const chatbotBox = document.getElementById("chatbotBox");

const chatbotForm = document.getElementById("chatbotForm");

const chatInput = document.getElementById("chatInput");

const chatbotMessages = document.getElementById("chatbotMessages");

const newChatButton = document.getElementById("newChat");


/* =====================================================
   6. CONVERSATION HISTORY
===================================================== */

// Stores previous user and AI messages.

let conversationHistory = [];


/* =====================================================
   7. OPEN CHATBOT
===================================================== */

if (chatbotToggle && chatbotBox) {

    chatbotToggle.addEventListener("click", function () {

        chatbotBox.classList.add("active");

        if (chatInput) {
            chatInput.focus();
        }

    });

}


/* =====================================================
   8. CLOSE CHATBOT
===================================================== */

if (chatbotClose && chatbotBox) {

    chatbotClose.addEventListener("click", function () {

        chatbotBox.classList.remove("active");

    });

}


/* =====================================================
   9. AUTOMATIC SCROLL FUNCTION
===================================================== */

function scrollToBottom() {

    if (chatbotMessages) {

        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    }

}


/* =====================================================
   10. TYPING ANIMATION FUNCTION
===================================================== */

function showTypingAnimation() {

    const typingMessage = document.createElement("div");

    typingMessage.className = "bot-message typing-indicator";

    typingMessage.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    chatbotMessages.appendChild(typingMessage);

    scrollToBottom();

    return typingMessage;

}


/* =====================================================
   11. CHATBOT MESSAGE SUBMISSION
===================================================== */

if (chatbotForm && chatInput && chatbotMessages) {

    chatbotForm.addEventListener("submit", async function (event) {

        // Prevent page refresh
        event.preventDefault();

        // Keep chatbot open
        if (chatbotBox) {
            chatbotBox.classList.add("active");
        }

        // Get user message
        const message = chatInput.value.trim();

        if (!message) {
            return;
        }


        // Display user message
        const userMessage = document.createElement("div");

        userMessage.className = "user-message";

        userMessage.textContent = message;

        chatbotMessages.appendChild(userMessage);

        chatInput.value = "";


        // Disable input and send button
        const sendButton = chatbotForm.querySelector(
            "button[type='submit']"
        );

        chatInput.disabled = true;

        if (sendButton) {
            sendButton.disabled = true;
        }


        // Show typing animation
        const typingMessage = showTypingAnimation();


        try {

            // Send message to FastAPI backend
            const response = await fetch(
                "http://127.0.0.1:8000/chat",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        message: message,

                        history: conversationHistory

                    })

                }
            );


            // Check server response
            if (!response.ok) {

                throw new Error(
                    "Unable to get response from backend"
                );

            }


            // Convert response into JSON
            const data = await response.json();


            // Validate AI response
            if (!data.reply) {

                throw new Error("AI response is empty");

            }


            // Remove typing animation
            typingMessage.remove();


            // Display AI response
            const botMessage = document.createElement("div");

            botMessage.className = "bot-message";

            botMessage.textContent = data.reply;

            chatbotMessages.appendChild(botMessage);


            // Store conversation history
            conversationHistory.push(

                {
                    role: "user",
                    content: message
                },

                {
                    role: "assistant",
                    content: data.reply
                }

            );


        } catch (error) {

            console.error("Chatbot Error:", error);

            // Remove typing animation
            typingMessage.remove();


            // Display error message
            const errorMessage = document.createElement("div");

            errorMessage.className = "bot-message";

            errorMessage.textContent =
                "Sorry, something went wrong. Please try again.";

            chatbotMessages.appendChild(errorMessage);


        } finally {

            // Enable input again
            chatInput.disabled = false;

            if (sendButton) {
                sendButton.disabled = false;
            }


            // Keep chatbot open
            if (chatbotBox) {
                chatbotBox.classList.add("active");
            }


            // Focus input
            chatInput.focus();


            // Automatic scrolling
            scrollToBottom();

        }

    });

}


/* =====================================================
   12. NEW CHAT FUNCTIONALITY
===================================================== */

if (newChatButton && chatbotMessages) {

    newChatButton.addEventListener("click", function () {

        // Clear conversation history
        conversationHistory = [];


        // Reset chatbot messages
        chatbotMessages.innerHTML = `
            <div class="bot-message">
                Hi! I'm Digvijay's AI assistant.
                Ask me about his skills, experience and projects.
            </div>
        `;


        // Clear input
        if (chatInput) {

            chatInput.value = "";

            chatInput.disabled = false;

        }


        // Keep chatbot open
        if (chatbotBox) {

            chatbotBox.classList.add("active");

        }


        // Scroll to bottom
        scrollToBottom();


    });

}


/* =====================================================
   13. END OF PORTFOLIO JAVASCRIPT
===================================================== */

console.log("Digvijay Portfolio JavaScript Loaded Successfully!");
