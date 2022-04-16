/**
 * @jest-environment jsdom
 */
import { it, beforeEach, expect } from "@jest/globals";
import { GUESS_ACTION, RESET_ACTION, SUBMIT_ACTION } from "../src/actions";
import { NUM_GAMES_TO_TEST } from "../src/config";
import {
  WordleBoardRenderer,
  WordleDistributionChartRenderer,
} from "../src/renderers";
import Wordle from "../src/wordle";

describe("renderers", () => {
  describe("WordleBoardRenderer", () => {
    let renderer;
    let rows;
    beforeEach(() => {
      document.body.innerHTML = `
            <div class="container">
                <div class="board-container">
                    <div class="board">
                    ${Array.from({ length: 6 })
                      .map(
                        () =>
                          `<div class="row">
                            <div class="tile"></div>
                            <div class="tile"></div>
                            <div class="tile"></div>
                            <div class="tile"></div>
                            <div class="tile"></div>
                        </div>`
                      )
                      .join("")}
                    </div>
                </div>
            </div>`;
      rows = document.querySelectorAll(".row");
      renderer = new WordleBoardRenderer();
    });

    const expectTileState = (tilesInRow, state) => {
      for (let i = 0; i < tilesInRow.length; i++) {
        expect(tilesInRow[i].className.split(" ")).toContain(state[i]);
      }
    };

    it("renders correct guess", () => {
      const game = new Wordle("arose");
      game.submit("arose");
      renderer.render(GUESS_ACTION, game);
      expect(rows[0].className).toContain("done");
      expectTileState(
        rows[0].querySelectorAll(".tile"),
        new Array(5).fill("correct")
      );
    });

    it("renders incorrect letters in guess", () => {
      const game = new Wordle("arose");
      game.submit("chuck");
      renderer.render(GUESS_ACTION, game);
      expect(rows[0].className).toContain("done");
      expectTileState(
        rows[0].querySelectorAll(".tile"),
        new Array(5).fill("incorrect")
      );
    });

    it("renders misplaced letters in guess", () => {
      const game = new Wordle("arose");
      game.submit("chaos");
      renderer.render(GUESS_ACTION, game);

      expect(rows[0].className).toContain("done");
      expectTileState(rows[0].querySelectorAll(".tile"), [
        "incorrect",
        "incorrect",
        "present",
        "present",
        "present",
      ]);
    });

    it("renders the ith guess on the ith row", () => {
      const game = new Wordle("arose");
      game.submit("chaos");
      renderer.render(GUESS_ACTION, game);

      expect(rows[0].className).toContain("done");
      expectTileState(rows[0].querySelectorAll(".tile"), [
        "incorrect",
        "incorrect",
        "present",
        "present",
        "present",
      ]);

      game.submit("roast");
      renderer.render(GUESS_ACTION, game);

      expect(rows[1].className).toContain("done");
      expectTileState(rows[1].querySelectorAll(".tile"), [
        "present",
        "present",
        "present",
        "correct",
        "incorrect",
      ]);

      game.submit("proof");
      renderer.render(GUESS_ACTION, game);

      expect(rows[2].className).toContain("done");
      expectTileState(rows[2].querySelectorAll(".tile"), [
        "incorrect",
        "correct",
        "correct",
        "incorrect",
        "incorrect",
      ]);

      game.submit("shore");
      renderer.render(GUESS_ACTION, game);

      expect(rows[3].className).toContain("done");
      expectTileState(rows[3].querySelectorAll(".tile"), [
        "present",
        "incorrect",
        "correct",
        "present",
        "correct",
      ]);

      game.submit("arose");
      renderer.render(GUESS_ACTION, game);

      expect(rows[4].className).toContain("done");
      expectTileState(
        rows[4].querySelectorAll(".tile"),
        new Array(5).fill("correct")
      );
    });

    it("renders all guesses on submit", () => {
      const game = new Wordle("arose");
      game.submit("chaos");
      game.submit("roast");
      game.submit("proof");
      game.submit("shore");
      game.submit("arose");
      renderer.render(SUBMIT_ACTION, game);

      expect(rows[0].className).toContain("done");
      expectTileState(rows[0].querySelectorAll(".tile"), [
        "incorrect",
        "incorrect",
        "present",
        "present",
        "present",
      ]);
      expect(rows[1].className).toContain("done");
      expectTileState(rows[1].querySelectorAll(".tile"), [
        "present",
        "present",
        "present",
        "correct",
        "incorrect",
      ]);
      expect(rows[2].className).toContain("done");
      expectTileState(rows[2].querySelectorAll(".tile"), [
        "incorrect",
        "correct",
        "correct",
        "incorrect",
        "incorrect",
      ]);
      expect(rows[3].className).toContain("done");
      expectTileState(rows[3].querySelectorAll(".tile"), [
        "present",
        "incorrect",
        "correct",
        "present",
        "correct",
      ]);
      expect(rows[4].className).toContain("done");
      expectTileState(
        rows[4].querySelectorAll(".tile"),
        new Array(5).fill("correct")
      );
    });

    it("clears old cells on submit", () => {
      let game = new Wordle("arose");
      game.submit("chaos");
      game.submit("arose");
      renderer.render(SUBMIT_ACTION, game);
      game = new Wordle("arose");
      game.submit("arose");
      renderer.render(SUBMIT_ACTION, game);

      expect(rows[0].className).toContain("done");
      expect(rows[1].className).not.toContain("done");
      expect(
        new Set(
          [...rows[1].querySelectorAll(".tile")].map((tile) => tile.className)
        ).size
      ).toBe(1);
    });

    it("clears the game on reset", () => {
      const game = new Wordle("arose");
      game.submit("chaos");
      renderer.render(GUESS_ACTION, game);
      renderer.render(RESET_ACTION, game);

      expect(rows[0].className).not.toContain("done");
      expect(
        [...rows[0].querySelectorAll(".tile")]
          .map((tile) => tile.className)
          .filter((className) => className === "tile")
      ).toHaveLength(5);
    });
  });

  describe("WordleDistributionChartRenderer", () => {
    let renderer;
    let bars;
    beforeEach(() => {
      document.body.innerHTML = `
            <div class="dist">
                <h2>Win Distributions <small><span id="gamect" class="muted">0/1000</span></small></h2>
                ${Array.from({ length: 7 })
                  .map(
                    (_, idx) =>
                      `<div class="progress-container">
                    <p class="val">${idx}</p>
                    <div class="progress"><div class="progress-bar"></div></div>
                    <p class="ct">0</p>
                </div>`
                  )
                  .join("")}
            </div>`;
      bars = document.querySelectorAll(".progress-container");
      renderer = new WordleDistributionChartRenderer();
    });

    it("increments 0 if the game was lost", () => {
      const game = new Wordle("arose");
      game.submit("hello");
      game.submit("tests");
      game.submit("chaos");
      game.submit("shoot");
      game.submit("foots");
      game.submit("hosts");
      renderer.render(SUBMIT_ACTION, game);

      expect(bars[0].querySelector(".progress-bar").style.width).toBe(
        `${(1 / NUM_GAMES_TO_TEST) * 100}%`
      );
    });

    it("increments 1 if the game was one in one guess", () => {
      const game = new Wordle("arose");
      game.submit("arose");
      renderer.render(SUBMIT_ACTION, game);

      expect(bars[1].querySelector(".progress-bar").style.width).toBe(
        `${(1 / NUM_GAMES_TO_TEST) * 100}%`
      );
    });

    it("resets the chart on RESET_ACTION", () => {
      const game = new Wordle("arose");
      game.submit("cloak");
      game.submit("chaos");
      game.submit("small");
      game.submit("shoot");
      game.submit("foots");
      game.submit("arose");
      renderer.render(SUBMIT_ACTION, game);
      renderer.render(RESET_ACTION, game);

      expect(
        [...bars].filter(
          (bar) => bar.querySelector(".progress-bar").style.width !== "0%"
        )
      ).toHaveLength(0);
      expect(
        [...bars].filter((bar) => bar.querySelector(".ct").textContent !== "0")
      ).toHaveLength(0);

      renderer.render(SUBMIT_ACTION, game);

      expect(bars[6].querySelector(".ct").textContent).toBe("1");
    });
  });
});
