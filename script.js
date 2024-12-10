window.onbeforeunload = () => {
    localStorage.removeItem("all-chats");
    localStorage.removeItem("themeColor");
};

const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
// Add conversation history array
let conversationHistory = [];
const API_KEY = "xai-2OwaheOxVIUkItBU8Bj7jRYzbXE8mYIcmsBVCAr4Lk4t4aTkD9EuPzGOUBj1MMGDicoUswxZ8rh0lpNe";
const API_URL = "https://api.x.ai/v1/chat/completions";

const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("themeColor");
    // Load conversation history from localStorage
    const savedHistory = localStorage.getItem("conversationHistory");
    if (savedHistory) {
        conversationHistory = JSON.parse(savedHistory);
    }

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>Grok AI by Hayato_shino05</h1>
                            <p>Được Lấy cảm hứng từ JARVIS của Iron Man, Grok AI mang một phong cách giao tiếp hài hước và thẳng thắn giống con người.</br><br>Thiết kế của Grok không chỉ để trả lời mà còn để khơi gợi suy nghĩ từ những góc nhìn rộng lớn hơn, thường liên hệ với các khái niệm vũ trụ và triết học.</br>
                            <br>Grok hướng tới việc hỗ trợ người dùng trong các nhiệm vụ nghiên cứu phức tạp, khám phá không gian, và giải đáp những câu hỏi mang tính triết học hoặc khoa học sâu sắc, giúp mở rộng tầm nhìn và hiểu biết của con người về thế giới và vũ trụ.</br></p>
                        </div>`;

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
}

const getChatResponse = async (incomingChatDiv) => {
    const pElement = document.createElement("p");
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);

    let fullResponse = '';

    // Add a system message that emphasizes maintaining context
    const messages = [
        { 
            role: "system", 
            content: "You are Grok, a chatbot inspired by the Hitchhikers Guide to the Galaxy."
        },
        ...conversationHistory,
        { role: "user", content: userText }
    ];

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "grok-beta",
            messages: messages,
            temperature: 0.2, // Slightly increased for more natural responses
            stream: true,
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        incomingChatDiv.querySelector(".typing-animation").remove();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0].delta.content || '';
                        if (content) {
                            fullResponse += content;
                            pElement.textContent = fullResponse;
                            chatContainer.scrollTo(0, chatContainer.scrollHeight);
                        }
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
        }

        // Update conversation history
        conversationHistory.push(
            { role: "user", content: userText },
            { role: "assistant", content: fullResponse }
        );

        // Limit history to last 20 messages to prevent token limit issues
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
        localStorage.setItem("all-chats", chatContainer.innerHTML);

    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
    const reponseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="./favicon.ico" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if(!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="./user.png" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

deleteButton.addEventListener("click", () => {
    if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        // Also clear conversation history
        localStorage.removeItem("conversationHistory");
        conversationHistory = [];
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {   
    chatInput.style.height =  `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);