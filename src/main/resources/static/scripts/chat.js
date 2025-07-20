let selectedRecipient = null;
let privateSubscription = null;

function loadUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    fetch('api/users')
        .then(response => response.json())
        .then(users => {
            users.forEach(user => {
                if (user.username !== currentUsername) {
                    const li = document.createElement('li');
                    li.textContent = user.username;
                    li.onclick = () => selectRecipient(user.username);
                    userList.appendChild(li);
                }
            });
        });
}

function selectRecipient(username) {
    selectedRecipient = username;
    document.getElementById('currentRecipient').textContent = username;

    // Unsubscribe from previous private message subscription if exists
    if (stompClient && privateSubscription) {
        privateSubscription.unsubscribe();
    }

    // Subscribe to messages between current user and selected recipient
    if (stompClient && currentUsername && selectedRecipient) {
        privateSubscription = stompClient.subscribe(`/topic/user/${currentUsername}`, message => {
            const msg = JSON.parse(message.body);
            if ((msg.sender === selectedRecipient && msg.recipient === currentUsername) ||
                (msg.sender === currentUsername && msg.recipient === selectedRecipient)) {
                showMessage(msg);
            }
        });
    }

    // Load chat history
    fetch(`/messages/${username}?sender=${currentUsername}`)
        .then(response => response.json())
        .then(messages => {
            const messageList = document.getElementById('messageList');
            messageList.innerHTML = '';
            messages.forEach(showMessage);
        });
}
function sendMessage() {
    if (!currentUsername) {
        alert("You must log in to send group messages.");
        return;
    }
    const input = document.getElementById('messageInput');
    const messageContent = input.value.trim();
    if (messageContent && stompClient && selectedRecipient) {
        const chatMessage = {
            sender: currentUsername,
            recipient: selectedRecipient,
            content: messageContent
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        input.value = '';
    }
}

function showMessage(message) {
    const messageList = document.getElementById('messageList');
    const li = document.createElement('li');
    li.textContent = `${message.sender}: ${message.content}`;
    messageList.appendChild(li);
}

function sendGroupMessage() {
    if (!currentUsername) {
        alert("You must log in to send group messages.");
        return;
    }
    const input = document.getElementById('groupMessageInput');
    const messageContent = input.value.trim();
    if (messageContent && stompClient && selectedGroupId) {
        const chatMessage = {
            sender: currentUsername,
            groupId: selectedGroupId,
            content: messageContent
        };
        stompClient.send("/app/chat.sendGroupMessage", {}, JSON.stringify(chatMessage));
        input.value = '';
    }
}

function showGroupMessage(message) {
    const messageList = document.getElementById('groupMessageList');
    const li = document.createElement('li');
    li.textContent = `${message.sender}: ${message.content}`;
    messageList.appendChild(li);
}

function switchChatMode() {
    const mode = document.getElementById('chatModeSelect').value;

    document.getElementById('privateChat').style.display = 'none';
    document.getElementById('groupChat').style.display = 'none';
    document.getElementById('openaiChat').style.display = 'none';

    if (mode === 'private') {
        document.getElementById('privateChat').style.display = 'block';
        loadUsers();
    } else if (mode === 'group') {
        document.getElementById('groupChat').style.display = 'block';
        loadGroups();
    } else if (mode === 'ai') {
        document.getElementById('openaiChat').style.display = 'block';
    }
}
