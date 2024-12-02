const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;

// Load dữ liệu từ localStorage
const loadDataFromLocalstorage = () => {
    // Load theme setting
    const themeColor = localStorage.getItem("themeColor");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    // Load chat history hoặc hiển thị text mặc định
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

// Tạo một phần tử chat
const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
};

// Gửi yêu cầu tới API và nhận phản hồi
const getChatResponse = async (incomingChatDiv) => {
    const pElement = document.createElement("p");
    const typingAnimation = incomingChatDiv.querySelector(".typing-animation");

    try {
        const response = await fetch("/api/grok", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userText }),
        });

        // Kiểm tra trạng thái phản hồi
        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error:", response.status, errorText);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Kiểm tra cấu trúc phản hồi
        if (data?.choices?.[0]?.message?.content) {
            pElement.textContent = data.choices[0].message.content;
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error("Error fetching chat response:", error);
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    } finally {
        // Xóa typing animation và thêm nội dung phản hồi
        if (typingAnimation) typingAnimation.remove();
        const chatDetails = incomingChatDiv.querySelector(".chat-details") || incomingChatDiv;
        chatDetails.appendChild(pElement);

        // Lưu lịch sử vào localStorage
        localStorage.setItem("all-chats", chatContainer.innerHTML);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
    }
};

// Xử lý chat của người dùng
const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    // Xóa nội dung input
    chatInput.value = "";
    chatInput.style.height = "auto";

    // Tạo chat outgoing
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

    // Tạo chat incoming sau 500ms
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

// Xử lý phím Enter
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

// Xử lý sự kiện button
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

// Tự động thay đổi chiều cao của input
chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Load dữ liệu ban đầu
loadDataFromLocalstorage();
