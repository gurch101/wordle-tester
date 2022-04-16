import { expect, it, beforeEach } from "@jest/globals";
import Wordle from "../src/wordle";

describe("wordle", () => {
  let wordle;
  beforeEach(() => {
    wordle = new Wordle("arose");
  });

  it("should throw an error if a non-string word is submitted", () => {
    const throwable = () => wordle.submit(null);

    expect(throwable).toThrow("Invalid word: null");
  });

  it("should throw an error if a word longer than 5 characters is submitted", () => {
    const throwable = () => wordle.submit("abcdef");

    expect(throwable).toThrow("Guess should have exactly 5 characters");
  });

  it("should throw an error if a word with non alphabet characters is submitted", () => {
    const throwable = () => wordle.submit("abcd0");

    expect(throwable).toThrow("Guess can only contain 'a' to 'z'");
  });

  it("should throw an error if more than 6 words are submitted", () => {
    wordle.submit("proof");
    wordle.submit("chaos");
    wordle.submit("tests");
    wordle.submit("pests");
    wordle.submit("chest");
    wordle.submit("float");
    const throwable = () => wordle.submit("crest");

    expect(throwable).toThrow("Game over: no more guesses allowed");
  });

  it("should throw an error if a guess is submitted after the game was solved", () => {
    wordle.submit("arose");
    const throwable = () => wordle.submit("choas");

    expect(throwable).toThrow("Game over: no more guesses allowed");
  });

  it("should throw an error if an invalid word is submitted", () => {
    const throwable = () => wordle.submit("abcde");

    expect(throwable).toThrow("Invalid word: abcde");
  });

  it("should mark incorrect characters", () => {
    let guesses = wordle.submit("prose");

    expect(guesses).toHaveLength(1);
    expect(guesses[0].score).toBe("x++++");

    guesses = wordle.submit("froze");

    expect(guesses).toHaveLength(2);
    expect(guesses[1].score).toBe("x++x+");

    guesses = wordle.submit("proof");

    expect(guesses[2].score).toBe("x++xx");
  });

  it("should mark misplaced characters", () => {
    let guesses = wordle.submit("roast");

    expect(guesses[0].score).toBe("///+x");
    guesses = wordle.submit("chaos");

    expect(guesses[1].score).toBe("xx///");
    guesses = wordle.submit("tooth");

    expect(guesses[2].score).toBe("xx+xx");
  });

  it("should mark correct characters", () => {
    const guesses = wordle.submit("arose");

    expect(guesses[0].score).toBe("+++++");
  });

  it("should mark the game as over if six guesses have been made", () => {
    wordle.submit("proof");
    wordle.submit("chaos");
    wordle.submit("tests");
    wordle.submit("pests");
    wordle.submit("chest");
    wordle.submit("float");

    expect(wordle.isGameOver()).toBeTruthy();
  });

  it("should mark the game as over if the correct guess has been made", () => {
    wordle.submit("arose");

    expect(wordle.isGameOver()).toBeTruthy();
  });

  it("should return 0 if the game was lost", () => {
    wordle.submit("proof");
    wordle.submit("chaos");
    wordle.submit("tests");
    wordle.submit("pests");
    wordle.submit("chest");
    wordle.submit("float");

    expect(wordle.numGuessesToWin()).toBe(0);
  });

  it("should return the number of guesses it took to win", () => {
    wordle.submit("arose");

    expect(wordle.numGuessesToWin()).toBe(1);
  });
});
