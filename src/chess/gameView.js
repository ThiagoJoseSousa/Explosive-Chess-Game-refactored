import { decideUI } from "./gameController.js";

const table = document.getElementById("board");

export default function renderBoard() {
  table.classList.add("board");
  let green = false;

  for (let x = 0; x < 8; x++) {
    const tableRow = document.createElement("tr");
    tableRow.setAttribute("class", "tableRow");
    for (let y = 0; y < 8; y++) {
      const tableSquare = document.createElement("td");
      tableSquare.setAttribute("data-coords", `${x}${y}`);
      tableSquare.classList.add("board-square");
      whiteOrGreen(green, tableSquare);
      green = !green;
      tableRow.appendChild(tableSquare);
    }
    table.appendChild(tableRow);
    green = !green;
  }
}

function whiteOrGreen(green, tableSquare) {
  if (green) {
    tableSquare.classList.add("green");
    return;
  }
  tableSquare.classList.add("white");
}

export function clearTable() {
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
}

export function renderPiece(x, y, imgPath) {
  const tableSquare = table.querySelector(`[data-coords='${x}${y}']`);
  const pieceImg = document.createElement("img");
  pieceImg.setAttribute("src", imgPath);
  pieceImg.classList.add("pieceImg");
  tableSquare.appendChild(pieceImg);
}

/* events listeners */

export function showPossibilitiesSquare(x, y, legalMoves) {
  const tableSquare = table.querySelector(`[data-coords='${x}${y}']`);
  tableSquare.classList.add("clickablePiece");
  tableSquare.addEventListener("click", () => {
    displayPlaceable(legalMoves, tableSquare);
  });
}

function displayPlaceable(legalMoves, selectedSquare) {
  clearPossibilities();
  legalMoves.forEach((legalCoords) => {
    if (!legalCoords) {
      return;
    }
    legalCoords = [parseInt(legalCoords[0], 10), parseInt(legalCoords[1], 10)];
    const legalMoveSquare = table.querySelector(
      `[data-coords='${legalCoords[0]}${legalCoords[1]}']`
    );
    const greyIndicator = document.createElement("div");
    greyIndicator.classList.add("grey");
    legalMoveSquare.appendChild(greyIndicator);

    legalMoveSquare.addEventListener("click", () => {
      clearTable();
      renderBoard();
      decideUI(legalCoords, selectedSquare);
    });
  });
}

function clearPossibilities() {
  const greyIndicators = document.getElementsByClassName("grey");
  while (greyIndicators.length > 0) {
    let square = greyIndicators[0].parentElement;
    square.removeChild(greyIndicators[0]);
    const noListenerSquare = square.cloneNode(true);
    square.replaceWith(noListenerSquare);
  }
}

export function askForAttack(coords, attackFn, explodeFn) {
  const tableSquare = table.querySelector(
    `[data-coords="${coords[0]}${coords[1]}"]`
  );
  tableSquare.classList.add("dying-square");

  const choiceDiv = document.createElement("div");
  choiceDiv.setAttribute("id", "choiceBox");

  const normalAttackBtn = document.createElement("button");
  normalAttackBtn.textContent = "SWORD ATTACK!";
  const normalAttackImg = document.createElement("img");
  normalAttackImg.setAttribute("src", "../../public/images/sword.png");
  normalAttackBtn.appendChild(normalAttackImg);
  normalAttackBtn.addEventListener("click", attackFn);

  const explodeAttackBtn = document.createElement("button");
  explodeAttackBtn.textContent = "DYNAMITE ATTACK!";
  const explodeAttackImg = document.createElement("img");
  explodeAttackImg.setAttribute("src", "../../public/images/dynamite.png");
  explodeAttackBtn.addEventListener("click", explodeFn);
  explodeAttackBtn.appendChild(explodeAttackImg);

  choiceDiv.appendChild(normalAttackBtn);
  choiceDiv.appendChild(explodeAttackBtn);
  tableSquare.appendChild(choiceDiv);
}

export function askWhichPieceToPromote(coords, color, promote) {
  const promotingSquare = table.querySelector(
    `[data-coords="${coords[0]}${coords[1]}"]`
  );
  const choiceDiv = document.createElement("div");
  choiceDiv.classList.add("promotingChoiceBox");

  const typeOfPieces = ["bishop", "knight", "queen", "rook"];
  for (let i = 0; i < typeOfPieces.length; i++) {
    const pieceImg = document.createElement("img");
    pieceImg.setAttribute(
      "src",
      `../../public/images/pieces/${color} ${typeOfPieces[i]}.png`
    );
    pieceImg.addEventListener("click", promote);
    choiceDiv.appendChild(pieceImg);
  }
  const pieceImg = document.createElement("img");
  pieceImg.setAttribute(
    "src",
    `../../public/images/pieces/${color} ${color}Pawn.png`
  );
  pieceImg.addEventListener("click", promote);
  choiceDiv.appendChild(pieceImg);

  promotingSquare.appendChild(choiceDiv);
}

export function displayEnd(color) {
  const overlay = document.createElement("div");
  overlay.classList.add("endDisplay");

  const para = document.createElement("p");

  para.textContent = `${color} has won the game!`;

  overlay.style.height = `${table.clientHeight}px`;
  overlay.style.width = `${table.clientWidth}px`;

  overlay.appendChild(para);
  table.parentElement.appendChild(overlay);
}
