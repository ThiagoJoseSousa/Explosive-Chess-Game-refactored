import startBoard from "./gameModel.js";
import renderBoard, {
  renderPiece,
  showPossibilitiesSquare,
  askForAttack,
  clearTable,
  askWhichPieceToPromote,
  displayEnd,
} from "./gameView.js";

renderBoard();
const board = startBoard();

function renderAllPieces() {
  const playerPiecesSet = {
    whitePlayer: board.players[0].pieces,
    blackPlayer: board.players[1].pieces,
  };

  let color = "white";
  for (const player in playerPiecesSet) {
    if (playerPiecesSet.hasOwnProperty(player)) {
      playerPiecesSet[player].forEach((piece) => {
        if (!piece.dead) {
          renderPiece(
            piece.coords[0],
            piece.coords[1],
            `../../public/images/pieces/${color} ${piece.type}.png`
          );
        }
      });
      color = "black";
    }
  }
}

export function addClickToShowLegal(player) {
  const winningColor = board.checkForEnd();
  if (winningColor) {
    displayEnd(winningColor);
    return;
  }
  player.pieces.forEach((piece) => {
    if (!piece.dead) {
      showPossibilitiesSquare(
        piece.coords[0],
        piece.coords[1],
        player.getLegalCoords(piece, board)
      );
    }
  });
}

renderAllPieces();
addClickToShowLegal(board.players[0]);

export function decideUI(newXY, renderedStartXY) {
  const piece = board.lookForPiece(
    renderedStartXY.dataset.coords[0],
    renderedStartXY.dataset.coords[1]
  );
  let decision = "move";

  if (piece.isNewYPromote && piece.isNewYPromote(newXY[1])) {
    decision += "Promote";
  }
  if (board.lookForPiece(newXY[0], newXY[1])) {
    decision += "Attack";
  }

  uisDisposition[decision](piece, newXY);
}

// arguments have what function will be the callback to the click
const uisDisposition = {
  move(piece, newXY) {
    piece.move(newXY[0], newXY[1], board);
    board.changeTurn();
    renderAllPieces();
  },
  moveAttack(piece, newXY) {
    renderAllPieces();
    askForAttack(
      newXY,
      () => {
        piece.normalAttack(newXY[0], newXY[1], board);
        clearTable();
        renderBoard();
        board.changeTurn();
        renderAllPieces();
      },
      () => {
        piece.explodeAttack(newXY[0], newXY[1], board);
        clearTable();
        renderBoard();
        board.changeTurn();
        renderAllPieces();

        const explosionCenter = document.querySelector(
          `[data-coords="${newXY[0]}${newXY[1]}"]`
        );
        explosionCenter.addEventListener("animationend", () => {
          explosionCenter.classList.remove("exploding");
        });
        explosionCenter.classList.add("exploding");
      }
    );
  },
  movePromote(piece, newXY) {
    const color = board.getPieceColor(piece);
    piece.move(newXY[0], newXY[1], board);
    renderAllPieces();
    askWhichPieceToPromote(newXY, color, (e) => {
      piece.promotePiece(getPieceType(e));
      clearTable();
      renderBoard();
      board.changeTurn();
      renderAllPieces();
    });
  },
  movePromoteAttack(piece, newXY) {
    const color = board.getPieceColor(piece);
    piece.normalAttack(newXY[0], newXY[1], board);
    renderAllPieces();
    askWhichPieceToPromote(newXY, color, (e) => {
      piece.promotePiece(getPieceType(e));
      clearTable();
      renderBoard();
      renderAllPieces();

      askForAttack(
        newXY,
        () => {
          clearTable();
          renderBoard();
          board.changeTurn();
          renderAllPieces();
        },
        () => {
          piece.explodeAttack(newXY[0], newXY[1], board);
          clearTable();
          renderBoard();
          board.changeTurn();
          renderAllPieces();

          const explosionCenter = document.querySelector(
            `[data-coords="${newXY[0]}${newXY[1]}"]`
          );
          explosionCenter.addEventListener("animationend", () => {
            explosionCenter.classList.remove("exploding");
          });

          explosionCenter.classList.add("exploding");
        }
      );
    });
  },
};

function getPieceType(e) {
  const imgPath = e.target.src;
  return imgPath.slice(51, imgPath.length - 4);
}
