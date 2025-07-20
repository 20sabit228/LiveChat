let stompClient = null;
//let currentUsername = "sabit"; // Replace with the logged-in user's name
let selectedRecipient = null;
let currentUsername = null;
function signup() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value.trim();

    if (!username || !password) {
        document.getElementById('authMessage').innerText = "Username or password can't be empty";
        return;
    }

    fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(res => res.text())
        .then(msg => document.getElementById('authMessage').innerText = msg);
}

function login() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value.trim();

    if (!username || !password) {
        document.getElementById('authMessage').innerText = "Username or password can't be empty";
        return;
    }

    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(res => {
            if (!res.ok) throw new Error("Invalid credentials");
            return res.text();
        })
        .then(msg => {
            document.getElementById('authMessage').innerText = "Logged in as " + username;
            currentUsername = username;
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('chatModeSelect').disabled = false;
            connect();
        })
        .catch(err => document.getElementById('authMessage').innerText = err.message);
}

// Fetch and display users
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
    // Load chat history between current user and selected recipient
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
// Fetch and display groups
function loadGroups() {
    const groupList = document.getElementById('groupList');
    groupList.innerHTML = '';
    fetch('/groups')
        .then(response => response.json())
        .then(groups => {
            groups.forEach(group => {
                const li = document.createElement('li');
                li.textContent = group.name;
                li.onclick = () => selectGroup(group.id, group.name);
                groupList.appendChild(li);
            });
        });
}


function selectGroup(groupId, groupName) {
    selectedGroupId = groupId;
    document.getElementById('currentGroup').textContent = groupName;
    fetch(`/group-messages/${groupId}`)
        .then(response => response.json())
        .then(messages => {
            const messageList = document.getElementById('groupMessageList');
            messageList.innerHTML = '';
            messages.forEach(showGroupMessage);
        });
    // Subscribe to group topic
    if (stompClient) {
        stompClient.subscribe(`/topic/group/${groupId}`, function (message) {
            showGroupMessage(JSON.parse(message.body));
        });
    }
}
function connect() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function () {
        // You can subscribe to group topics after group selection
    });
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
// --------- AI Chatbot ---------
function ask() {
    const question = document.getElementById('question').value.trim();
    if (!question) return alert("Please type a question.");

    fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({question})
    })
        .then(response => {
            if (!response.ok) throw new Error("AI service error");
            return response.text();
        })
        .then(answer => {
            document.getElementById('answer').innerText = answer;
        })
        .catch(() => {
            document.getElementById('answer').innerText = "Error getting response from AI.";
        });
}
function switchChatMode() {
    const mode = document.getElementById('chatModeSelect').value;

    document.getElementById('privateChat').style.display = 'none';
    document.getElementById('groupChat').style.display = 'none';
    document.getElementById('openaiChat').style.display = 'none';

    if (mode === 'private') {
        document.getElementById('privateChat').style.display = 'block';
        loadUsers(); // load user list
    } else if (mode === 'group') {
        document.getElementById('groupChat').style.display = 'block';
        loadGroups(); // load group list
    } else if (mode === 'ai') {
        document.getElementById('openaiChat').style.display = 'block';
    }
}


connect();
