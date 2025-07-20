let currentUserGroups = [];
let selectedGroupId = null;
let groupSubscription = null;

function showCreateGroupForm() {
    document.getElementById('createGroupForm').style.display = 'block';
    document.getElementById('createGroupBtn').style.display = 'none';
}

function hideCreateGroupForm() {
    document.getElementById('createGroupForm').style.display = 'none';
    document.getElementById('createGroupBtn').style.display = 'inline-block';
    document.getElementById('createGroupMessage').innerText = '';
}

function createGroup() {
    const groupName = document.getElementById('newGroupName').value.trim();
    if (!groupName) {
        document.getElementById('createGroupMessage').innerText = 'Group name cannot be empty';
        return;
    }

    fetch('/api/groups', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: groupName, creator: currentUsername })
    })
        .then(res => res.json())
        .then(group => {
            document.getElementById('createGroupMessage').innerText = 'Group created!';
            hideCreateGroupForm();
            loadGroups();
        })
        .catch(() => {
            document.getElementById('createGroupMessage').innerText = 'Failed to create group';
        });
}

function loadGroups() {
    fetch('/api/groups')
        .then(res => res.json())
        .then(groups => {
            const joinedList = document.getElementById('joinedGroupList');
            const otherList = document.getElementById('otherGroupList');
            joinedList.innerHTML = '';
            otherList.innerHTML = '';

            const joinedGroups = [];
            const otherGroups = [];

            groups.forEach(g => {
                if (g.members && g.members.includes(currentUsername)) {
                    joinedGroups.push(g);
                } else {
                    otherGroups.push(g);
                }
            });

            joinedGroups.forEach(g => {
                const li = document.createElement('li');
                li.textContent = g.name;
                li.onclick = () => selectGroup(g.id, g.name);
                joinedList.appendChild(li);
            });

            otherGroups.forEach(g => {
                const li = document.createElement('li');
                li.textContent = g.name + ' (Join)';
                li.style.fontStyle = 'italic';
                li.style.color = 'blue';
                li.style.cursor = 'pointer';
                li.onclick = () => joinGroup(g.id, g.name);
                otherList.appendChild(li);
            });
        });
}

function joinGroup(groupId, groupName) {
    fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username: currentUsername })
    })
        .then(res => {
            if (!res.ok) throw new Error('Join failed');
            return res.text();
        })
        .then(() => {
            currentUserGroups.push(groupId);
            loadGroups();
            selectGroup(groupId, groupName);
        })
        .catch(() => alert('Failed to join group'));
}

function selectGroup(groupId, groupName) {
    selectedGroupId = groupId;
    document.getElementById('currentGroup').textContent = groupName;
    fetch(`/group-messages/${groupId}`)
        .then(res => res.json())
        .then(messages => {
            const msgList = document.getElementById('groupMessageList');
            msgList.innerHTML = '';
            messages.forEach(m => {
                const li = document.createElement('li');
                li.textContent = `${m.sender}: ${m.content}`;
                msgList.appendChild(li);
            });
        });

    if (stompClient) {
        if (groupSubscription) {
            groupSubscription.unsubscribe();
        }
        groupSubscription = stompClient.subscribe(`/topic/group/${groupId}`, message => {
            const msg = JSON.parse(message.body);
            showGroupMessage(msg);
        });
    }
}
