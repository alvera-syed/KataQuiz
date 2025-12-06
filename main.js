// Initialize variables
let score = 0;
let questionCount = 0;
let scoreLabel = null;
let answered = false; // Prevents double click/double load
let seenQuestions = new Set(); // keeps track of past questions

let timer = null;
let timeLeft = 15; // 15 seconds per question

/**
 * Fetches data and creates questions 
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

    // Start timer for this question
    startTimer();

    // Display question + number
    document.getElementById("question").innerHTML = question;
    document.getElementById("questionNum").innerText = `Question ${questionCount + 1} of 10`;

    // Show question area (in case it was hidden)
    document.getElementById("question").style.display = "block";
    document.getElementById("container").style.display = "block";
    document.getElementById("questionNum").style.display = "block";
    document.getElementById("timer").style.display = "block";

    // Shuffle answers
    let options = [answer, ...incorrectAnswers];
    options.sort(() => Math.random() - 0.5);

    // Render options
    let container = document.getElementById("container");
    container.innerHTML = "";

    // Creates a radio button as clickable option. (T/F or MCQ)
    options.forEach(option => {
        let input = document.createElement("input");
        input.type = "radio";
        input.value = option;
        input.name = "quiz";

        let label = document.createElement("label");
        label.innerHTML = option;

        container.appendChild(input);
        container.appendChild(label);
        container.appendChild(document.createElement("br"));

        input.onclick = () => {
            if (answered) return; // prevent double-click
            answered = true; // lock question

            clearInterval(timer); // stop timer when user answers
            container.querySelectorAll("input").forEach(i => i.disabled = true); // Disable all answers

            // Scoring
            if (input.value === answer) {
                score++;
                scoreLabel.innerText = "Score: " + score;
            }

            // Count question only once
            questionCount++;

            // If reached final question -> show end state
            if (questionCount === 10) {
                endQuiz();
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
 * End-of-quiz UI and cleanup
 */
const endQuiz = () => {
    clearInterval(timer);
    answered = true;

    // Hide question elements
    document.getElementById("container").style.display = "none";
    document.getElementById("question").style.display = "none";
    document.getElementById("questionNum").style.display = "none";
    document.getElementById("timer").style.display = "none";
    document.getElementById("score").style.display = "none";

    // Show end message inside quiz box
    document.getElementById("end-message").style.display = "block";
    document.getElementById("finalScore").innerText = `Quiz complete! Final score: ${score}/10`;

    // Ensure the controls (selects + start) are visible again so user can choose new quiz after pressing Play Again
    // We don't auto-start here; Play Again will prepare the UI for manual restart.
};

/**
 * Waits for page to load html and js
 */
window.onload = () => {
    scoreLabel = document.getElementById("score");

    // initial UI state: hide question/timer/end-message until Start pressed
    document.getElementById("question").style.display = "none";
    document.getElementById("container").style.display = "none";
    document.getElementById("questionNum").style.display = "none";
    document.getElementById("timer").style.display = "none";
    document.getElementById("end-message").style.display = "none";

    // Start button -> begin the quiz (use current control values)
    document.getElementById("start").onclick = () => {
        // Prepare fresh quiz
        score = 0;
        questionCount = 0;
        seenQuestions.clear();
        answered = false;
        scoreLabel.innerText = "Score: " + score;

        // Hide controls while quiz is running
        document.getElementById("controls").style.display = "none";
        document.getElementById("end-message").style.display = "none";
        document.getElementById("score").style.display = "block";

        // Load first question (Start triggers fetch)
        loadNewQuestion();
    };

    // Play Again -> return to initial state (do NOT auto-start)
    document.getElementById("playAgain").onclick = () => {
        // Reset variables
        score = 0;
        questionCount = 0;
        seenQuestions.clear();
        answered = false;
        clearInterval(timer);
        scoreLabel.innerText = "Score: " + score;

        // Hide end message, hide question area
        document.getElementById("end-message").style.display = "none";
        document.getElementById("container").style.display = "none";
        document.getElementById("question").style.display = "none";
        document.getElementById("questionNum").style.display = "none";
        document.getElementById("timer").style.display = "none";

        // Show controls again so user must pick options and click Start
        document.getElementById("controls").style.display = "block";
    };
};

const startTimer = () => {
    clearInterval(timer); // stop any existing timer
    timeLeft = 15; // reset for new question
    document.getElementById("timer").innerText = `Time: ${timeLeft} seconds`;
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = `Time: ${timeLeft} seconds`;
        
        if (timeLeft <= 0) {
            clearInterval(timer); // stop timer
            answered = true; // lock question
            document.querySelectorAll("#container input").forEach(i => i.disabled = true);
            questionCount++;
            
            if (questionCount === 10) {
                clearInterval(timer); // make sure timer stops
                endQuiz();
                return;
            }
            setTimeout(loadNewQuestion, 1000); // go to next question
        }
    }, 1000);
};
