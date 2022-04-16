import Wordle from "./wordle";
import { RESET_ACTION, SUBMIT_ACTION, GUESS_ACTION } from "./actions";
import { NUM_GAMES_TO_TEST, WORD_LIST } from "./config";

const TAB_SPACES = 4;

class Editor {
  private game: Wordle;
  private renderer: (action: number, game: Wordle) => void;
  private iframe: HTMLIFrameElement;
  private editor: HTMLTextAreaElement;
  private submitButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;
  private guessButton: HTMLButtonElement;
  private error: HTMLElement;
  private code: string;
  private isSubmissionRunning: boolean;

  constructor(renderer) {
    this.game = new Wordle();
    this.renderer = renderer;
    this.iframe = null;
    this.editor = document.getElementById("editor") as HTMLTextAreaElement;
    this.error = document.getElementById("error");
    this.submitButton = document.getElementById("submit") as HTMLButtonElement;
    this.resetButton = document.getElementById("reset") as HTMLButtonElement;
    this.guessButton = document.getElementById("guess") as HTMLButtonElement;

    this.isSubmissionRunning = false;
    this.resetButton.addEventListener("click", this.reset.bind(this));
    this.guessButton.addEventListener("click", this.guess.bind(this));
    this.submitButton.addEventListener("click", this.submit.bind(this));

    // allow tabs in textarea
    this.editor.addEventListener("keydown", function (e) {
      e.stopPropagation();
      if (e.key == "Tab") {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        this.value =
          this.value.substring(0, start) + "    " + this.value.substring(end);

        // put caret at right position again
        this.selectionStart = this.selectionEnd = start + TAB_SPACES;
      }
    });
  }

  reset(initIndex?: number) {
    this._clearError();
    this.game = new Wordle("", initIndex);
    this.renderer(RESET_ACTION, this.game);
    this._insertCode();
  }

  _clearError() {
    this.error.textContent = "";
    this.error.className = "error";
  }

  _showError(msg) {
    this.error.textContent = msg;
    this.error.className = "error show";
  }

  _insertCode() {
    document.querySelector("#env").remove();
    this.iframe = document.createElement("iframe");
    this.iframe.id = "env";
    this.iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    document.body.appendChild(this.iframe);
    const head = this.iframe.contentDocument.getElementsByTagName("head")[0];
    const script = this.iframe.contentDocument.createElement("script");
    script.innerHTML = this.editor.value;
    script.type = "text/javascript";
    head.innerHTML = "";
    head.appendChild(script);
  }

  _callGuessWord() {
    if (typeof this.iframe.contentWindow["guessWord"] !== "function") {
      throw new Error("guessWord function not defined");
    }
    return this.iframe.contentWindow["guessWord"](
      WORD_LIST,
      this.game.getGuesses()
    );
  }

  guess() {
    this._clearError();
    if (this.editor.value !== this.code) {
      this.reset();
      this.code = this.editor.value;
    }

    try {
      const userGuess = this._callGuessWord();
      this.game.submit(userGuess);
      this.renderer(GUESS_ACTION, this.game);
    } catch (e) {
      this._showError(e.message);
    }
  }

  _submitAll(numGamesRemaining) {
    setTimeout(() => {
      try {
        while (!this.game.isGameOver()) {
          const userGuess = this._callGuessWord();
          this.game.submit(userGuess);
        }
        this.renderer(SUBMIT_ACTION, this.game);
      } catch (e) {
        console.log(e);
        this._showError(e.message);
      }
      if (numGamesRemaining > 1 && this.isSubmissionRunning) {
        this.game = new Wordle();
        this._submitAll(--numGamesRemaining);
      }
    }, 1);
  }

  submit() {
    if(this.isSubmissionRunning) {
      this.isSubmissionRunning = false;
      this.submitButton.textContent = "Submit";
      this.submitButton.className = "";
      this.guessButton.disabled = false;
      this.resetButton.disabled = false;
    } else {
      this.reset(0);
      this.isSubmissionRunning = true;
      this.submitButton.textContent = "Stop";
      this.submitButton.className = "red";
      this.guessButton.disabled = true;
      this.resetButton.disabled = true;
      this._submitAll(NUM_GAMES_TO_TEST);
    }
  }
}

export default Editor;
