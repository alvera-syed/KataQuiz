// Initialize variables
let score = 0;
let questionCount = 0;
let scoreLabel = null;
let answered = false; // Prevents double click/double load
let seenQuestions = new Set(); // keeps track of past questions

/**
 * Fetches data and creates questions 
 * @param {*} category - category of question
 * @param {*} difficulty - difficulty of question
 * @param {*} type - type of question
 * @returns void
 */
const fetchData = async (category, difficulty, type) => {
    // Specific url based on params
    let url = `https://opentdb.com/api.php?amount=1&category=${category}&difficulty=${difficulty}&type=${type}`;

    // Fetches json and data
    let response = await fetch(url);
    let data = await response.json();

    // Handle empty results
    if (!data.results || data.results.length === 0) {
        document.getElementById("question").textContent = "Loading...";
        setTimeout(() => loadNewQuestion(), 1000); //1 second wait
        return;
    }

    // Set json info to variables
    let answer = data.results[0].correct_answer;
    let incorrectAnswers = data.results[0].incorrect_answers;
    let question = data.results[0].question;
    // If we've seen this question before, fetch a new one
    if (seenQuestions.has(question)) {
        return loadNewQuestion(); 
    }
    seenQuestions.add(question); // mark as used

    // Reset answered tracker
    answered = false;

    // Display question + number
    document.getElementById("question").innerHTML = question;
    document.getElementById("questionNum").innerText = `Question ${questionCount + 1} of 10`;

    // Shuffle answers
    let options = [answer, ...incorrectAnswers]
    options.sort(() => Math.random() - 0.5);

    // Render options
    let container = document.getElementById("container");
    container.innerHTML = "";

    // Creates a radio button as clickable option.
    // True or false
    // Or MCQ
    options.forEach(option => {
        let input = document.createElement("input");
        input.type = "radio";
        input.value = option;
        input.name = "quiz";

        let label = document.createElement("label");
        label.innerHTML = option;

        // //for css hover coloring
        // label.textContent = option;
        // label.classList.add("option");

        container.appendChild(input);
        container.appendChild(label);
        container.appendChild(document.createElement("br"));

        input.onclick = () => {
            if (answered) return; // prevent double-click
            answered = true;      // lock question

            // Disable all answers
            container.querySelectorAll("input").forEach(i => i.disabled = true);

            // Scoring
            if (input.value === answer) {
                score++;
                scoreLabel.innerText = "Score: " + score;
            }

            // Count question only once
            questionCount++;

            if (questionCount === 10) {
                alert(`Quiz complete! Final score: ${score}/10`);
                return;
            }

            // Wait before loading next
            setTimeout(loadNewQuestion, 1500);
        };
    });
}

/**
 * Creates new question
 */
const loadNewQuestion = async () => {
    let category = document.getElementById("category").value;
    let difficulty = document.getElementById("difficulty").value;
    let type = document.getElementById("type").value;
    await fetchData(category, difficulty, type);
}

/**
 * Waits for page to load html and js
 */
window.onload = () => {
    scoreLabel = document.getElementById("score");

    document.getElementById("start").onclick = () => {
        score = 0;
        questionCount = 0;
        scoreLabel.innerText = "Score: " + score;
        loadNewQuestion();
    }
};