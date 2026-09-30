(function () {
  "use strict";

  const MAX_FILE_SIZE = 1024 * 1024;
  const setupPanel = document.querySelector("#setup-panel");
  const quizPanel = document.querySelector("#quiz-panel");
  const notesInput = document.querySelector("#study-notes");
  const fileInput = document.querySelector("#notes-file");
  const fileStatus = document.querySelector("#file-status");
  const setupMessage = document.querySelector("#setup-message");
  const quizMessage = document.querySelector("#quiz-message");
  const questionList = document.querySelector("#question-list");
  const quizForm = document.querySelector("#quiz-form");
  const resultBanner = document.querySelector("#result-banner");
  const checkButton = document.querySelector("#check-button");
  const newQuizButton = document.querySelector("#new-quiz-button");
  const generateButton = document.querySelector("#generate-button");
  const questions = [];

  function showMessage(element, message) {
    element.textContent = message;
    element.hidden = false;
  }

  function clearMessage(element) {
    element.textContent = "";
    element.hidden = true;
  }

  function makeQuestion(question, index) {
    const card = document.createElement("fieldset");
    card.className = "question-card";
    card.dataset.answer = question.answer;

    const legend = document.createElement("legend");
    legend.className = "question-prompt";

    const number = document.createElement("span");
    number.className = "question-index";
    number.textContent = String(index + 1).padStart(2, "0");
    number.setAttribute("aria-hidden", "true");

    const prompt = document.createElement("span");
    prompt.textContent = question.prompt;
    legend.append(number, prompt);
    card.append(legend);

    const options = document.createElement("div");
    options.className = "answer-options";
    question.options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      label.className = "answer-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question-${index}`;
      input.value = option;
      input.required = true;

      const text = document.createElement("span");
      text.textContent = option;
      label.append(input, text);
      options.append(label);
    });
    card.append(options);
    questionList.append(card);
  }

  function resetQuizResults() {
    clearMessage(quizMessage);
    resultBanner.hidden = true;
    resultBanner.textContent = "";
    checkButton.hidden = false;
    newQuizButton.hidden = true;
    questionList.querySelectorAll(".question-explanation").forEach((item) => item.remove());
    questionList.querySelectorAll(".answer-option").forEach((item) => {
      item.classList.remove("correct", "incorrect");
    });
    questionList.querySelectorAll("input").forEach((input) => {
      input.disabled = false;
    });
  }

  function createQuiz() {
    clearMessage(setupMessage);
    const sourceText = notesInput.value.trim();

    if (sourceText.length < 30) {
      showMessage(setupMessage, "Add at least a few sentences (30 characters or more) so there is enough material to make a quiz.");
      notesInput.focus();
      return;
    }

    const generated = window.StudyMateQuiz.generate(
      sourceText,
      document.querySelector("#question-count").value,
      document.querySelector("#difficulty").value,
    );

    if (generated.length === 0) {
      showMessage(setupMessage, "I couldn't find enough distinct study terms in that text. Add more sentences with specific names, concepts, or vocabulary and try again.");
      notesInput.focus();
      return;
    }

    questions.splice(0, questions.length, ...generated);
    questionList.replaceChildren();
    generated.forEach(makeQuestion);
    resetQuizResults();
    document.querySelector("#quiz-progress").textContent =
      `${generated.length} QUESTION${generated.length === 1 ? "" : "S"} · PRACTICE QUIZ`;
    setupPanel.hidden = true;
    quizPanel.hidden = false;
    quizPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    quizPanel.querySelector("h2").focus({ preventScroll: true });
  }

  function checkAnswers(event) {
    event.preventDefault();
    clearMessage(quizMessage);

    const unanswered = questions.findIndex(
      (_, index) => !quizForm.querySelector(`input[name="question-${index}"]:checked`),
    );
    if (unanswered !== -1) {
      showMessage(quizMessage, `Choose an answer for question ${unanswered + 1} before checking your quiz.`);
      quizForm.querySelector(`input[name="question-${unanswered}"]`).focus();
      return;
    }

    let score = 0;
    questionList.querySelectorAll(".question-card").forEach((card, index) => {
      const answer = card.dataset.answer;
      const selected = quizForm.querySelector(`input[name="question-${index}"]:checked`);
      const correct = selected.value.toLowerCase() === answer;
      if (correct) {
        score += 1;
      }

      card.querySelectorAll(".answer-option").forEach((label) => {
        const input = label.querySelector("input");
        if (input.value.toLowerCase() === answer) {
          label.classList.add("correct");
        } else if (input.checked && !correct) {
          label.classList.add("incorrect");
        }
        input.disabled = true;
      });

      const explanation = document.createElement("p");
      explanation.className = "question-explanation";
      explanation.textContent = `From your notes: ${questions[index].explanation}`;
      card.append(explanation);
    });

    const percentage = Math.round((score / questions.length) * 100);
    resultBanner.textContent = `You got ${score} of ${questions.length} correct (${percentage}%). Review the highlighted answers and try again when you're ready.`;
    resultBanner.hidden = false;
    checkButton.hidden = true;
    newQuizButton.hidden = false;
    resultBanner.focus();
  }

  fileInput.addEventListener("change", async () => {
    clearMessage(setupMessage);
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showMessage(setupMessage, "That file is larger than 1 MB. Choose a smaller plain-text file.");
      fileInput.value = "";
      return;
    }

    if (!/\.(txt|md)$/i.test(file.name)) {
      showMessage(setupMessage, "This demo can read plain text files only (.txt or .md). Paste notes from other document types into the box instead.");
      fileInput.value = "";
      return;
    }

    try {
      notesInput.value = await file.text();
      fileStatus.textContent = `${file.name} loaded locally. You can edit its text below.`;
    } catch (error) {
      showMessage(setupMessage, "The selected file couldn't be read. Try another plain-text file or paste your notes.");
      fileInput.value = "";
    }
  });

  generateButton.addEventListener("click", createQuiz);
  quizForm.addEventListener("submit", checkAnswers);
  document.querySelector("#edit-notes-button").addEventListener("click", () => {
    quizPanel.hidden = true;
    setupPanel.hidden = false;
    setupPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    notesInput.focus({ preventScroll: true });
  });
  newQuizButton.addEventListener("click", () => {
    quizPanel.hidden = true;
    setupPanel.hidden = false;
    setupPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    generateButton.focus({ preventScroll: true });
  });
})();
