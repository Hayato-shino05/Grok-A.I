const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_URL = "xai-2OwaheOxVIUkItBU8Bj7jRYzbXE8mYIcmsBVCAr4Lk4t4aTkD9EuPzGOUBj1MMGDicoUswxZ8rh0lpNe";
const API_KEY = "PASTE-YOUR-GROK-API-KEY-HERE";

const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("themeColor");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>Grok AI by Hayato_shino05</h1>
                            <p>Được Lấy cảm hứng từ JARVIS của Iron Man, Grok AI mang một phong cách giao tiếp hài hước và thẳng thắn.</br><br>Thiết kế của Grok không chỉ để trả lời mà còn để khơi gợi suy nghĩ từ những góc nhìn rộng lớn hơn, thường liên hệ với các khái niệm vũ trụ và triết học.</br>
                            <br>Grok hướng tới việc hỗ trợ người dùng trong các nhiệm vụ nghiên cứu phức tạp, khám phá không gian, và giải đáp những câu hỏi mang tính triết học hoặc khoa học sâu sắc, giúp mở rộng tầm nhìn và hiểu biết của con người về thế giới và vũ trụ.</br></p>
                        </div>`;

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
};

const getChatResponse = async (incomingChatDiv) => {
    const pElement = document.createElement("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "grok-vision-beta",
            messages: [
                { 
                    role: "system", 
                    content: "You are a helpful AI assistant inspired by JARVIS from Iron Man. You communicate with humor and directness, often relating concepts to the universe and philosophy." 
                },
                { role: "user", content: userText }
            ],
            temperature: 0.7,
            stream: false
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Something went wrong");
        pElement.textContent = data.choices[0].message.content;
    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "Có lỗi xảy ra khi nhận phản hồi. Vui lòng thử lại.";
    }

    // Remove the typing animation and replace with the chat content
    const chatContent = document.createElement("div");
    chatContent.className = "chat-content";
    
    const chatDetails = document.createElement("div");
    chatDetails.className = "chat-details";
    chatDetails.innerHTML = `
        <img src="grok-img.png" alt="grok-img" class="chat-avatar">
        <div class="message-content">${pElement.outerHTML}</div>
    `;
    
    chatContent.appendChild(chatDetails);
    incomingChatDiv.innerHTML = ''; // Clear the loading animation
    incomingChatDiv.appendChild(chatContent);
    
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = "";

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="user-img.png" alt="user-img" class="chat-avatar">
                        <div class="message-content">
                            <p>${userText}</p>
                        </div>
                    </div>
                </div>`;

    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    
    setTimeout(() => {
        const loadingHtml = `<div class="chat-content">
                            <div class="chat-details">
                                <img src="grok-img.png" alt="grok-img" class="chat-avatar">
                                <div class="typing-animation">
                                    <div class="typing-dot" style="--delay: 0.2s"></div>
                                    <div class="typing-dot" style="--delay: 0.3s"></div>
                                    <div class="typing-dot" style="--delay: 0.4s"></div>
                                </div>
                            </div>
                        </div>`;
        const incomingChatDiv = createChatElement(loadingHtml, "incoming");
        chatContainer.appendChild(incomingChatDiv);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
        getChatResponse(incomingChatDiv);
    }, 500);
};

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

sendButton.addEventListener("click", handleOutgoingChat);

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", document.body.classList.contains("light-mode") ? "light_mode" : "dark_mode");
});

deleteButton.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả các cuộc trò chuyện?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

loadDataFromLocalstorage();