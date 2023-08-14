const ANSWER_LENGTH = 5;
const ROUNDS = 6;
const letters = document.querySelectorAll(".scoreboard-letter");
const guessDisp = document.querySelectorAll(".game-over");
const loading = document.querySelector(".spinner");

async function init() {
    let currGuess = "";
    let currRow = 0; // one row for each guess
    let correctGuesses = ['x', 'x', 'x', 'x', 'x'];

    // FETCH THE SECRET WORD FROM API
    let done = false; // to maintain state of the game
    let isLoading = true;
    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split(''); // array of individual chars/ letters
    
    isLoading = false;
    setLoading(isLoading);


    /* FUNCTION TO ADD AN INPUTTED LETTER */
    function addLetter(letter) {
        if(currGuess.length < ANSWER_LENGTH) {
            currGuess += letter;
        } else {
            // currGuess = currGuess.substring(0, currGuess.length - 1) + letter;
            currGuess[currGuess.length - 1] = letter; // replace the last letter
        }

        // letters is a list with each letter-div as an element in order
        // so, if we index it according to the number we can get that div from array
        // i.e., letters[1] gives the 2nd letter-div and subsequently same for all indices
        // (ANSWER_LENGTH * currRow + currGuess.length - 1) => to move onto different rows
        letters[currRow * ANSWER_LENGTH + currGuess.length - 1].innerText = letter;
    }

    /* FUNCTION TO SUBMIT THE WORD */
    async function submitWord() {
        if(currGuess.length !== ANSWER_LENGTH) {
            // do nothing
            return;
        }

        // validate the word => check if user input is an actual word or not
        isLoading = true;
        setLoading(isLoading);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currGuess }),
        });

        const resObj = await res.json();
        const validWord = resObj.validWord; // const { validWord } = resObj;
        isLoading = false;
        setLoading(isLoading);

        if(!validWord) {
            markInvalidWord();
            return;
        }

        // mark the letter-divs as "correct", "close" or "wrong"
        // CORRECT => letter in secret word and in the right position (mark green)
        // CLOSE => letter in secret word but mot in right position (mark yellow)
        // WRONG => letter not there in secret word (mark grey)
        const guessParts = currGuess.split('') ; // array of individual chars/ letters
        const map = makeMap(wordParts); // unique letter frequencies in word

        for(let i=0; i<ANSWER_LENGTH; i++) {
            // marking "correct"
            if(guessParts[i] === wordParts[i]) {
                letters[currRow * ANSWER_LENGTH + i].classList.add('correct');
                map[guessParts[i]]--; // decrement the letter freq, denoting marked
            }
        }

        // marking "close" and "wrong"
        for(let i=0; i<ANSWER_LENGTH; i++) {
            if(guessParts[i] === wordParts[i]) {
                // do nothing
                correctGuesses[i] = guessParts[i];
            } else if(map[guessParts[i]] && map[guessParts[i]] > 0) {
                letters[currRow * ANSWER_LENGTH + i].classList.add('close');
                map[guessParts[i]]--;
            } else {
                letters[currRow * ANSWER_LENGTH + i].classList.add('wrong');
            }
        }

        // adding inputs in guessing display above scoreboard letters
        for(let i=0; i<ANSWER_LENGTH; i++) {
            guessDisp[i].textContent = correctGuesses[i];
            console.log(correctGuesses[i], guessDisp[i]);
            if(correctGuesses[i] === 'x') {
                guessDisp[i].classList.add('wrong');
            } else {
                guessDisp[i].classList.remove('wrong');
                guessDisp[i].classList.add('correct');
            }
        }

        // increment row and give a new guess
        currRow++;

        // game over
        let temp = document.querySelectorAll('.game-over');
        if(currGuess === word) {
            for(let i=0; i<ANSWER_LENGTH; i++) {
                temp[i].classList.add('win-bgc');
            }
            done = true;
            return;
        } else if(currRow === ROUNDS) {
            // alert(`YOU LOSE! The word was  ${word}`);
            for(let i=0; i<ANSWER_LENGTH; i++) {
                guessDisp[i].textContent = wordParts[i];
                guessDisp[i].style.backgroundColor = "red";
            }
            done  = true;
            return;
        }

        currGuess = '';
    }

    function backSpace() {
        currGuess = currGuess.substring(0, currGuess.length - 1);
        letters[currRow * ANSWER_LENGTH + currGuess.length].innerText = ""; // clear letter-div
        // not doing -1 in the index because for input after backspace the new input must go to the cleared letter-div i.e., it is one more than the index after clearing, so if we add -1 at the end, it will keep replacing the character before the letter-div we just cleared
    }

    function markInvalidWord() {
        for(let i=0; i<ANSWER_LENGTH; i++) {
            // need to remove the class as if user backspaces and types invalid word again it must flash again
            letters[currRow * ANSWER_LENGTH + i].classList.remove('invalid');

            // setTimeout( callback function, time to wait (ms) )
            setTimeout(
                () => letters[currRow * ANSWER_LENGTH + i].classList.add('invalid'),
                10
            );
        }
    }

    /* keydown because enter and backspace don't register on keypress */
    document.addEventListener('keydown', function handleKeyPress (event) {
        if(done || isLoading) {
            // do nothing
            return;
        }
        
        const action = event.key;
        if(action === 'Enter') {
            submitWord();
        } else if(action === 'Backspace') {
            backSpace();
        } else if(isLetter(action)) {
            addLetter(action.toUpperCase());
        } else {
            // do nothing
        }
    });

    let switcher = document.querySelector(".switch");
    switcher.addEventListener('click', () => {
        let checkbox = document.querySelector(".ip-box");
        let rules = document.querySelectorAll(".rule");
        let gameOvers = document.querySelectorAll(".game-over");
        if(checkbox.checked) {
            document.querySelector("body").style.backgroundColor = "#111";
            document.querySelector("body").style.color = "#fff";
            document.querySelector(".rule-list").style.border = "none";
            document.querySelector(".sub-list").style.border = "none";
            document.querySelector("#loader").src = "./Pulse-1s-200px dark-mode.gif";
            
            for(let i=0; i<rules.length; i++) {
                rules[i].style.color = "#fff";
                gameOvers[i].style.border = "5px solid #fff";
            }
        } else {
            document.querySelector("body").style.backgroundColor = "#f2f2f2";
            document.querySelector("body").style.color = "#333";
            document.querySelector("#loader").src = "./Pulse-1s-200px.gif";

            for(let i=0; i<rules.length; i++) {
                rules[i].style.color = "#000";
                gameOvers[i].style.border = "5px solid #000";
            }
        }  
    });
}

/* util function to check if given input is a letter or not */
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

/* util function to hide and unhide leading spinner */
function setLoading(isLoading) {
    loading.classList.toggle('show', isLoading);
    // toggle will add the 1st arg (class-name) based on isLoading's value
}

/* util function to make a map of how many repetitions of a letter in the word array */
// like a dictionary of letter frequencies
function makeMap(array) {
    const mapObj = {}
    for(let i=0; i<array.length; i++) {
        const letter = array[i]
        if(mapObj[letter]) {
            mapObj[letter]++;
        } else {
            mapObj[letter] = 1;
        }
    }
    return mapObj;
}

init();