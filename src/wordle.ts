import { LETTERS_PER_WORD, MAX_GUESSES, WORD_LIST, WORD_SET } from "./config";

interface Guess {
  score: string;
  word: string;
}

let currIndex = 0;

class Wordle {
  private word: string;
  private guesses: Guess[];

  constructor(word?: string, initIndex?: number) {
    currIndex = typeof initIndex === "number" ? initIndex : currIndex;
    this.word = word || WORD_LIST[currIndex++];
    this.guesses = [];
  }

  private getScore(guess) {
    const score = [];
    for (let i = 0; i < guess.length; i++) {
      const ch = guess.charAt(i);
      if (ch === this.word.charAt(i)) {
        score.push("+");
      } else if (this.word.indexOf(ch) < 0) {
        score.push("x");
      } else {
        // if the character is in the word at a position that hasn't been guessed as that
        // character, mark it as incorrectly placed
        for (let j = 0; j < guess.length; j++) {
          if (this.word.charAt(j) === ch && guess.charAt(j) !== ch) {
            score.push("/");
            break;
          }
        }
        // the character is in the word and has already been guessed correctly
        if (score.length !== i + 1) {
          score.push("x");
        }
      }
    }
    return score.join("");
  }

  isGameOver() {
    return (
      this.guesses.length === MAX_GUESSES ||
      (this.guesses.length > 0 &&
        this.guesses[this.guesses.length - 1]
          .score.split("")
          .filter((ch) => ch === "+").length === LETTERS_PER_WORD)
    );
  }

  numGuessesToWin() {
    return (
      this.guesses.findIndex((guess) => guess.score.indexOf("+++++") === 0) + 1
    );
  }

  getGuesses() {
    return JSON.parse(JSON.stringify(this.guesses));
  }

  submit(word) {
    if (
      this.guesses.length >= MAX_GUESSES ||
      (this.guesses.length > 0 && this.guesses[this.guesses.length - 1].score === "+++++")
    ) {
      throw new Error("Game over: no more guesses allowed");
    } else if (typeof word !== "string") {
      throw new Error(`Invalid word: ${word}`);
    } else if (word.length !== LETTERS_PER_WORD) {
      throw new Error("Guess should have exactly 5 characters");
    } else if (word.split("").filter((ch) => ch < "a" || ch > "z").length > 0) {
      throw new Error("Guess can only contain 'a' to 'z'");
    } else if (!WORD_SET.has(word)) {
      throw new Error(`Invalid word: ${word}`);
    }
    this.guesses.push({ word, score: this.getScore(word) });
    return this.guesses;
  }
}

export default Wordle;
