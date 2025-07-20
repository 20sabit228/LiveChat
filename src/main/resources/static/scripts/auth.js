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
            connect();  // from websocket.js
        })
        .catch(err => document.getElementById('authMessage').innerText = err.message);
}
