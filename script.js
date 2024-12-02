const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;

const loadDataFromLocalstorage = () => {
    // Load theme setting
    const themeColor = localStorage.getItem("themeColor");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    // Load default text or previous chats
    const defaultText = `<div class="default-text">
                            <h1>Grok AI by Hayato_shino05</h1>
                            <p>Được Lấy cảm hứng từ JARVIS của Iron Man, Grok AI mang một phong cách giao tiếp hài hước và thẳng thắn.</br>
                            <br>Thiết kế của Grok không chỉ để trả lời mà còn để khơi gợi suy nghĩ từ những góc nhìn rộng lớn hơn, thường liên hệ với các khái niệm vũ trụ và triết học.</br>
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
    
    try {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userText }),
        };

        const response = await (await fetch("/api/grok", requestOptions)).json();
        
        // Kiểm tra lỗi từ server
        if (response.error) {
            throw new Error(response.message || 'Server error');
        }

        // Xử lý response
        if (response.choices && response.choices[0]?.message?.content) {
            pElement.textContent = response.choices[0].message.content;
        } else {
            throw new Error('Invalid response format');
        }

    } catch (error) {
        console.error('Error:', error);
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    // Xóa animation typing và thêm response
    const typingAnimation = incomingChatDiv.querySelector(".typing-animation");
    if (typingAnimation) {
        typingAnimation.remove();
    }
    
    const chatDetails = incomingChatDiv.querySelector(".chat-details");
    if (chatDetails) {
        chatDetails.appendChild(pElement);
    } else {
        // Nếu không có chat-details, tạo mới
        const newChatDetails = document.createElement("div");
        newChatDetails.className = "chat-details";
        newChatDetails.appendChild(pElement);
        incomingChatDiv.appendChild(newChatDetails);
    }

    // Lưu chats vào localStorage
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    // Clear input
    chatInput.value = "";
    chatInput.style.height = "auto";

    // Create and append outgoing chat
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="user-img.png" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    // Tạo chat đến sau 500ms
    setTimeout(() => {
        const incomingChatDiv = createChatElement(`
            <div class="chat-content">
                <div class="chat-details">
                    <img src="chatbot-img.png" alt="chatbot-img">
                    <div class="typing-animation">...</div>
                </div>
            </div>
        `, "incoming");
        
        chatContainer.appendChild(incomingChatDiv);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
        getChatResponse(incomingChatDiv);
    }, 500);
};

// Handle Enter key
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

// Button event listeners
sendButton.addEventListener("click", handleOutgoingChat);

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", document.body.classList.contains("light-mode") ? "light_mode" : "dark_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

// Auto resize input height based on content
chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Load initial data
loadDataFromLocalstorage();