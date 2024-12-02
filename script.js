const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;

// API Configuration
const API_KEY = "xai-2OwaheOxVIUkItBU8Bj7jRYzbXE8mYIcmsBVCAr4Lk4t4aTkD9EuPzGOUBj1MMGDicoUswxZ8rh0lpNe"; // API Key của bạn
const API_URL = "https://api.x.ai/v1/chat/completions";

// Load dữ liệu từ localStorage
const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("themeColor");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `
        <div class="default-text">
            <h1>Grok AI by Hayato_shino05</h1>
            <p>
                Được lấy cảm hứng từ JARVIS của Iron Man, Grok AI mang một phong cách giao tiếp hài hước và thẳng thắn.
                <br>Grok hỗ trợ các nhiệm vụ nghiên cứu phức tạp, khám phá không gian và giải đáp các câu hỏi triết học hoặc khoa học sâu sắc.
            </p>
        </div>`;
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

// Tạo phần tử chat
const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
};

// Gửi yêu cầu đến API Grok và nhận phản hồi
const getChatResponse = async (incomingChatDiv) => {
    const pElement = document.createElement("p");
    const typingAnimation = incomingChatDiv.querySelector(".typing-animation");

    try {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "grok-vision-beta",
                messages: [
                    { role: "system", content: "You are a test assistant." },
                    { role: "user", content: userText },
                ],
                temperature: 0,
                stream: false,
            }),
        };

        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || "API Error");

        if (data?.choices?.[0]?.message?.content) {
            pElement.textContent = data.choices[0].message.content;
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error("Error:", error);
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    } finally {
        if (typingAnimation) typingAnimation.remove();
        const chatDetails = incomingChatDiv.querySelector(".chat-details") || incomingChatDiv;
        chatDetails.appendChild(pElement);

        localStorage.setItem("all-chats", chatContainer.innerHTML);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
    }
};

// Xử lý gửi chat
const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = "";
    chatInput.style.height = "auto";

    const outgoingHtml = `
        <div class="chat-content">
            <div class="chat-details">
                <img src="user-img.png" alt="user-img">
                <p>${userText}</p>
            </div>
        </div>`;
    const outgoingChatDiv = createChatElement(outgoingHtml, "outgoing");
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    setTimeout(() => {
        const incomingHtml = `
            <div class="chat-content">
                <div class="chat-details">
                    <img src="chatbot-img.png" alt="chatbot-img">
                    <div class="typing-animation">...</div>
                </div>
            </div>`;
        const incomingChatDiv = createChatElement(incomingHtml, "incoming");
        chatContainer.appendChild(incomingChatDiv);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
        getChatResponse(incomingChatDiv);
    }, 500);
};

// Xử lý sự kiện phím Enter
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

// Các sự kiện button
sendButton.addEventListener("click", handleOutgoingChat);

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const newTheme = document.body.classList.contains("light-mode") ? "light_mode" : "dark_mode";
    localStorage.setItem("themeColor", newTheme);
    themeButton.innerText = newTheme === "light_mode" ? "dark_mode" : "light_mode";
});

deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

// Tự động thay đổi chiều cao input
chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Load dữ liệu ban đầu
loadDataFromLocalstorage();
