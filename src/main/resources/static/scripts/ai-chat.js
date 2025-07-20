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
