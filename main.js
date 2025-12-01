let score = 0;
let questionCount = 0;
let scoreLabel = null;

let fetchData = async (category, difficulty, type) => {
    let url = `https://opentdb.com/api.php?amount=1&category=${category}&difficulty=${difficulty}&type=${type}`;
    let response = await fetch(url);
    let data = await response.json();

    if (!data.results || data.results.length === 0) {
        alert("No questions returned. Try again in a few seconds.");
        return;
    }

    let question = data.results[0].question;
    document.getElementById("question").textContent = question;

    let answer = data.results[0].correct_answer;
    let incorrectAnswers = data.results[0].incorrect_answers;

    let options = [answer, ...incorrectAnswers]
    options.sort(()=> Math.random() - 0.5);

    let container = document.getElementById("container");
    while (container.firstChild) container.removeChild(container.firstChild);

    options.forEach(option => {
        let input = document.createElement("input");
        input.type = "radio";
        input.value = option;
        input.name = "quiz";

        let label = document.createElement("label");
        label.textContent = option;

        container.appendChild(input);
        container.appendChild(label);
        container.appendChild(document.createElement("br"));

        input.onclick = () => {
            if (input.value === answer) {
                score++;
                scoreLabel.innerText = "Score: " + score;
            } 
            questionCount++;
        

            if (questionCount === 10) {
                alert(`Quiz complete! Final score: ${score}/10`);
                return;
            }

            setTimeout(loadNewQuestion, 3000); // 3s delay
        };
    });
    
    return answer;
}

let loadNewQuestion = async () => {
    let category = document.getElementById("category").value;
    let difficulty = document.getElementById("difficulty").value;
    let type = document.getElementById("type").value;
    await fetchData(category, difficulty, type);

}

window.onload = () => {
    let submitButton = document.getElementById("submit");
    scoreLabel = document.getElementById("score");

    submitButton.onclick = () => {
        score = 0;
        questionCount = 0;
        scoreLabel.innerText = "Score: " + score;
        loadNewQuestion();
    }
}