/**
 * @jest-environment jsdom
 */
import { it, beforeEach, expect, jest } from "@jest/globals";
import { GUESS_ACTION, RESET_ACTION, SUBMIT_ACTION } from "../src/actions";
import Editor from "../src/editor";

describe("Editor", () => {
  let editor;
  let mockRenderer;
  beforeEach(() => {
    document.body.innerHTML = `
        <iframe id="env"></iframe>
        <div id="error"></div>
        <div class="editor-container">
            <textarea id="editor">
                function guessWord(dict, guesses) {  
                    return 'arose';
                }
            </textarea>
            <button id="reset">Reset</button>
            <button id="guess">Guess</button>
            <button id="submit">Submit</button>
        </div>`;
    mockRenderer = jest.fn();
    editor = new Editor(mockRenderer);
    jest.useFakeTimers();
    jest.spyOn(global, "setTimeout");
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it("should guess a word when guess is clicked", () => {
    (document.querySelector("#guess") as HTMLButtonElement).click();

    // resets the editor on the initial click, then renders guess
    expect(mockRenderer).toHaveBeenCalledTimes(2);
    expect(mockRenderer.mock.calls[0][0]).toBe(RESET_ACTION);
    expect(mockRenderer.mock.calls[1][0]).toBe(GUESS_ACTION);
    expect(mockRenderer.mock.calls[1][1].guesses[0].word).toBe("arose");
  });

  it("should show an error message when the editor code is missing a guessWord function and guess is clicked", () => {
    (document.querySelector("#editor") as HTMLTextAreaElement).value =
      "var guessWord = '';";
    editor.guess();

    expect(document.querySelector("#error").textContent).toBe(
      "guessWord function not defined"
    );
  });

  it("should show an error message when the editor generates an invalid word when guess is clicked", () => {
    (document.querySelector("#editor") as HTMLTextAreaElement).value =
      "function guessWord(){return 'abcde'; }";
    editor.guess();

    expect(document.querySelector("#error").textContent).toBe(
      "Invalid word: abcde"
    );
  });

  it("should reset the game when reset is clicked", () => {
    editor.reset();

    expect(mockRenderer).toHaveBeenCalledTimes(1);
  });

  it("should simulate NUM_GAMES_TO_TEST playthroughs when submit is clicked", () => {
    editor.submit();

    // once for reset when the game starts
    expect(mockRenderer).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    jest.runOnlyPendingTimers();
    expect(setTimeout).toHaveBeenCalledTimes(2);
    expect(mockRenderer).toHaveBeenCalledTimes(2);
    expect(mockRenderer.mock.calls[1][0]).toBe(SUBMIT_ACTION);
  });

  it("should change the submit button to a stop button when submit is clicked", () => {
    editor.submit();

    expect(document.querySelector("#submit").textContent).toBe("Stop");
  });

  it("should stop the submission when stop is clicked and change the button back to submit", () => {
    editor.submit();
    editor.submit();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(document.querySelector("#submit").textContent).toBe("Submit");
    jest.runOnlyPendingTimers();
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });

  it('should disable the guess and reset buttons when submit is clicked', () => {
    editor.submit();

    expect((document.querySelector("#reset") as HTMLButtonElement).disabled).toBeTruthy();
    expect((document.querySelector("#guess") as HTMLButtonElement).disabled).toBeTruthy();
  });

  it('should re-enable the guess and reset buttons when stop is clicked', () => {
    editor.submit();
    editor.submit();

    expect((document.querySelector("#reset") as HTMLButtonElement).disabled).toBeFalsy();
    expect((document.querySelector("#guess") as HTMLButtonElement).disabled).toBeFalsy();
  });
});
