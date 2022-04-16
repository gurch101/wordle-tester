import { RESET_ACTION, SUBMIT_ACTION, GUESS_ACTION } from "./actions";
import { NUM_GAMES_TO_TEST, LETTERS_PER_WORD, MAX_GUESSES } from "./config";

const SCORE_CLASS_MAP = {
  "+": "correct",
  "/": "present",
  x: "incorrect",
};

class WordleBoardRenderer {
  private rows: NodeListOf<HTMLElement>;
  private tiles: NodeListOf<HTMLElement>;

  constructor() {
    this.rows = document.querySelectorAll(".row");
    this.tiles = document.querySelectorAll(".tile");
  }

  _renderGuess(rowNum, guess) {
    if (guess === undefined) {
      for (let i = 0; i < LETTERS_PER_WORD; i++) {
        this.tiles[i + LETTERS_PER_WORD * rowNum].textContent = "";
        this.tiles[i + LETTERS_PER_WORD * rowNum].className = "tile";
      }
      this.rows[rowNum].className = "row";
    } else {
      for (let i = 0; i < guess.word.length; i++) {
        const ch = guess.word.charAt(i);
        const score = guess.score.charAt(i);
        this.tiles[i + LETTERS_PER_WORD * rowNum].textContent = ch;
        this.tiles[
          i + LETTERS_PER_WORD * rowNum
        ].className = `tile ${SCORE_CLASS_MAP[score]}`;
      }
      this.rows[rowNum].className = "row done";
    }
  }

  render(action, wordle) {
    switch (action) {
      case RESET_ACTION:
        for (const row of this.rows) {
          row.className = "row";
        }
        for (const tile of this.tiles) {
          tile.textContent = "";
          tile.className = "tile";
        }
        break;
      case SUBMIT_ACTION:
        for (let i = 0; i < MAX_GUESSES; i++) {
          const guess = wordle.guesses[i];
          this._renderGuess(i, guess);
        }
        break;
      case GUESS_ACTION:
        this._renderGuess(wordle.guesses.length - 1, wordle.guesses.at(-1));
        break;
    }
  }
}

const RATIO_TO_PCT = 100;

class WordleDistributionChartRenderer {
  private scores: number[];
  private bars: NodeListOf<HTMLElement>;
  private gameCt: HTMLElement;
  private barCts: NodeListOf<HTMLElement>;
  private ct: number;

  constructor() {
    this.scores = new Array(MAX_GUESSES + 1).fill(0);
    this.bars = document.querySelectorAll(".progress-bar");
    this.gameCt = document.querySelector("#gamect");
    this.barCts = document.querySelectorAll(".ct");
    this.ct = 0;
  }

  render(action, wordle) {
    switch (action) {
      case RESET_ACTION:
        this.ct = 0;
        this.scores = new Array(MAX_GUESSES + 1).fill(0);
        break;
      case SUBMIT_ACTION:
        this.ct++;
        this.scores[wordle.numGuessesToWin()]++;
        break;
      default:
        return;
    }
    this.scores.forEach((score, index) => {
      this.bars[index].style.width = `${
        (score / NUM_GAMES_TO_TEST) * RATIO_TO_PCT
      }%`;
      this.barCts[index].textContent = score + "";
    });
    this.gameCt.textContent = `${this.ct}/${NUM_GAMES_TO_TEST}`;
  }
}

const renderer = (function () {
  const chart = new WordleDistributionChartRenderer();
  const board = new WordleBoardRenderer();

  return function (action, wordle) {
    chart.render(action, wordle);
    board.render(action, wordle);
  };
})();

export { WordleBoardRenderer, WordleDistributionChartRenderer, renderer };
