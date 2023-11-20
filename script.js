document.addEventListener("DOMContentLoaded", function () {
  const quoteContainer = document.getElementById("quote-container");
  const inputText = document.getElementById("input-text");
  const startButton = document.getElementById("start-button");
  const timeElement = document.getElementById("time");
  const mistakesElement = document.getElementById("mistakes");
  const wpmElement = document.getElementById("wpm");
  const accuracyElement = document.getElementById("accuracy");

  let timer;
  let testCompleted = false;
  let lastTypedText = '';
  let mistakes = 0;
  let totalChars = 0;
  let correctChars = 0;
  let remainingTime = 60;

  startButton.addEventListener("click", startTest);

  async function getRandomQuote() {
      try {
          const response = await fetch("https://api.quotable.io/random");
          if (response.ok) {
              const data = await response.json();
              return data.content;
          }
          throw new Error("Failed to fetch a quote.");
      } catch (error) {
          console.error(error);
          return "Failed to fetch a quote. Please try again later.";
      }
  }

  function startTest() {
      if (timer) {
          return;
      }

      getRandomQuote().then((quote) => {
          inputText.value = "";
          mistakes = 0;
          correctChars = 0;
          totalChars = 0;
          mistakesElement.innerText = "0";
          wpmElement.innerText = "0";
          accuracyElement.innerText = "100%";
          quoteContainer.querySelector("#quote").textContent = quote;

          inputText.focus();
          startButton.style.display = "none";
          remainingTime = 60;
          timeElement.innerText = remainingTime;

          timer = setInterval(() => {
              if (!testCompleted) {
                  remainingTime--;
                  if (remainingTime <= 0) {
                      clearInterval(timer);
                      timeElement.innerText = "0";
                      inputText.disabled = true;
                      displayTestResult(quote);
                  } else {
                      timeElement.innerText = remainingTime;
                  }
              }
          }, 1000);

          inputText.addEventListener("input", () => {
              if (!testCompleted) {
                  const typedText = inputText.value;
                  totalChars = typedText.length;

                  let currentMistakes = 0;

                  for (let i = 0; i < typedText.length; i++) {
                      if (typedText[i] !== quote[i]) {
                          currentMistakes++;
                      }
                  }

                  if (currentMistakes > mistakes) {
                      mistakes = currentMistakes;
                  }

                  mistakesElement.innerText = mistakes;

                  
                  const accuracy = ((1 - mistakes / quote.length) * 100).toFixed(2);
                  accuracyElement.innerText = `${accuracy}%`;

                  
                  updateQuote(quote, typedText);

                  lastTypedText = inputText.value;

                  if (typedText === quote) {
                      clearInterval(timer);
                      displayTestResult(quote);
                  }
              }
          });
      });
  }

  function displayTestResult(quote) {
      const typedText = inputText.value;
      const time = 60 - remainingTime;
      const words = quote.split(" ").length;
      const wpm = Math.round((words / time) * 60);
      wpmElement.innerText = wpm;

      testCompleted = true;
  }

  function updateQuote(quote, typedText) {
      const quoteElement = quoteContainer.querySelector("#quote");
      quoteElement.innerHTML = "";

      for (let i = 0; i < quote.length; i++) {
          const span = document.createElement("span");
          span.textContent = quote[i];

          if (i < typedText.length) {
              if (typedText[i] === quote[i]) {
                  span.classList.add("correct-char");
              } else {
                  span.classList.add("incorrect-char");
              }
          }

          quoteElement.appendChild(span);
      }
  }
});