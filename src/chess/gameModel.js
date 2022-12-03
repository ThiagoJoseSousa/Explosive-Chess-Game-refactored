import { addClickToShowLegal } from "./gameController.js";

const gameboardFactory = () => {
  const board = [
    new Array(8),
    new Array(8),
    new Array(8),
    new Array(8),
    new Array(8),
    new Array(8),
    new Array(8),
    new Array(8),
  ];
  const players = [];

  let turn = true;

  function addPlayer(player) {
    players.push(player);
  }
  function checkForEnd() {
    const whiteKing = players[0].getKing();
    const blackKing = players[1].getKing();

    if (whiteKing.dead && blackKing.dead) {
      return "draw";
    }
    if (whiteKing.dead) {
      return "black";
    }
    if (blackKing.dead) {
      return "white";
    }
    return false;
  }
  function changeTurn() {
    turn = turn !== true; // toggling boolean
    if (turn) {
      addClickToShowLegal(players[0]);
    } else {
      addClickToShowLegal(players[1]);
    }
  }
  function setToSquare(piece) {
    const { coords } = piece;
    board[coords[0][0]][coords[1][0]] = piece;
  }
  function removeFromSquare(piece) {
    const { coords } = piece;
    board[coords[0][0]][coords[1][0]] = undefined;
  }
  function lookForPiece(x, y) {
    x = parseInt(x, 10);
    y = parseInt(y, 10);
    if (!board[x][y]) {
      return undefined;
    }
    return board[x][y];
  }
  function getPieceColor(piece) {
    if (players[0].getPieceIndex(piece) !== -1) {
      return "white";
    }
    return "black";
  }
  return {
    addPlayer,
    checkForEnd,
    changeTurn,
    setToSquare,
    removeFromSquare,
    lookForPiece,
    getPieceColor,
    players,
    turn,
  };
};

const playerFactory = (color) => {
  const pieces = [];
  let human = false;

  function setHuman() {
    human = true;
  }
  function addPiece(piece) {
    pieces.push(piece);
  }
  function getKing() {
    return pieces[14];
  }
  function getLegalCoords(piece, board) {
    const noRulesCoords = piece.getMoves();
    let coordsInBoard;
    if (piece.finalFilter === "getFarCoords") {
      coordsInBoard = noRulesCoords.possibilities;
    } else {
      coordsInBoard = moveFilters.getInBoard(noRulesCoords);
    }
    const piecesFoundI = moveFilters.findPieces(board, coordsInBoard);
    return moveFilters[piece.finalFilter](
      this,
      coordsInBoard,
      piecesFoundI,
      board
    );
  }
  function getPieceIndex(piece) {
    for (let i = 0; i < pieces.length; i++) {
      if (piece === pieces[i]) {
        return i;
      }
    }
    return -1;
  }
  function setAllPiecesOnBoard(board) {
    pieces.forEach((piece) => {
      board.setToSquare(piece);
    });
  }

  return {
    setHuman,
    addPiece,
    getKing,
    getLegalCoords,
    getPieceIndex,
    setAllPiecesOnBoard,
    pieces,
  };
};

const pieceFactory = (coords, type, finalFilter) => {
  function getMoves() {
    return getAllMoves[this.type](coords[0][0], coords[1][0]);
  }

  function changeCoords(newX, newY) {
    coords[0][0] = newX;
    coords[1][0] = newY;
  }

  function move(newX, newY, board) {
    board.removeFromSquare(this);
    this.changeCoords(newX, newY);
    board.setToSquare(this);
  }
  function normalAttack(newX, newY, board) {
    const enemyPiece = board.lookForPiece(newX, newY);
    enemyPiece.dead = true;
    board.removeFromSquare(enemyPiece);
    this.move(newX, newY, board);
  }
  function explodeAttack(newX, newY, board) {
    newX = parseInt(newX, 10);
    newY = parseInt(newY, 10);
    let explodingArea = [
      [newX, newY],
      [newX + 1, newY],
      [newX - 1, newY],
      [newX, newY - 1],
      [newX - 1, newY - 1],
      [newX + 1, newY - 1],
      [newX, newY + 1],
      [newX - 1, newY + 1],
      [newX + 1, newY + 1],
    ];

    explodingArea = moveFilters.getInBoard({
      possibilities: explodingArea,
    });

    explodingArea.forEach((item) => {
      const piece = board.lookForPiece(item[0], item[1]);
      if (!piece) {
        return;
      }
      piece.dead = true;
      board.removeFromSquare(piece);
    });
    this.dead = true;
    board.removeFromSquare(this);
  }

  return {
    getMoves,
    changeCoords,
    move,
    normalAttack,
    explodeAttack,
    coords,
    type,
    finalFilter,
  };
};

const getAllMoves = {
  knight(x, y) {
    const initialCoords = [x, y];
    const possibilities = [
      [x + 1, y + 2],
      [x + 2, y + 1],
      [x - 1, y + 2],
      [x - 2, y + 1],
      [x + 1, y - 2],
      [x + 2, y - 1],
      [x - 2, y - 1],
      [x - 1, y - 2],
    ];
    return { initialCoords, possibilities };
  },
  king(x, y) {
    const initialCoords = [x, y];
    const possibilities = [
      [x + 1, y],
      [x + 1, y + 1],
      [x, y - 1],
      [x - 1, y],
      [x - 1, y + 1],
      [x - 1, y - 1],
      [x, y + 1],
      [x + 1, y - 1],
      // castle
      [x + 2, y],
      [x - 2, y],
    ];
    return { initialCoords, possibilities };
  },
  rook(x, y) {
    const initialCoords = [x, y];
    const possibilities = [];
    for (let i = 1; y + i < 8; i++) {
      possibilities.push([x, y + i]);
    }
    for (let i = 1; y - i > -1; i++) {
      possibilities.push([x, y - i]);
    }
    for (let i = 1; x - i > -1; i++) {
      possibilities.push([x - i, y]);
    }
    for (let i = 1; x + i < 8; i++) {
      possibilities.push([x + i, y]);
    }
    return { initialCoords, possibilities };
  },
  bishop(x, y) {
    const initialCoords = [x, y];
    const possibilities = [];
    // up-right
    for (let i = 1; x + i < 8 && y + i < 8; i++) {
      possibilities.push([x + i, y + i]);
    }
    // down-right
    for (let i = 1; x + i < 8 && y - i > -1; i++) {
      possibilities.push([x + i, y - i]);
    }
    // up-left
    for (let i = 1; x - i > -1 && y + i < 8; i++) {
      possibilities.push([x - i, y + i]);
    }
    // down-left
    for (let i = 1; x - i > -1 && y - i > -1; i++) {
      possibilities.push([x - i, y - i]);
    }
    return { initialCoords, possibilities };
  },
  queen(x, y) {
    const initialCoords = [x, y];
    const possibilities = [
      ...this.rook(x, y).possibilities,
      ...this.bishop(x, y).possibilities,
    ];
    return { initialCoords, possibilities };
  },
  whitePawn(x, y) {
    const initialCoords = [x, y];
    const possibilities = [
      [x, y + 1],
      [x, y + 2],
      [x + 1, y + 1],
      [x - 1, y + 1],
    ];

    possibilities[0].straight = true;
    possibilities[1].twoStraight = true;
    return { initialCoords, possibilities };
  },
  blackPawn(x, y) {
    const initialCoords = [x, y];
    const possibilities = [
      [x, y - 1],
      [x, y - 2],
      [x + 1, y - 1],
      [x - 1, y - 1],
    ];
    possibilities[0].straight = true;
    possibilities[1].twoStraight = true;
    return { initialCoords, possibilities };
  },
};
// reuse of check statements.
const moveFilters = {
  getInBoard(startAndPossibleCoords) {
    return startAndPossibleCoords.possibilities.filter(
      (coords) =>
        coords[0] < 8 && coords[0] > -1 && coords[1] < 8 && coords[1] > -1
    );
  },

  findPieces(board, coordsInBoard) {
    const piecesAreAt = coordsInBoard.reduce((prev, coords, i) => {
      if (board.lookForPiece(coords[0], coords[1])) {
        prev.push(i);
      }
      return prev;
    }, []);
    return piecesAreAt;
  },
  findMovesBeyondPieceI(coordsInBoard, pieceI) {
    let xDifference;
    let yDifference;
    //stop when direction is shifted
    while (coordsInBoard[pieceI]) {
      if (pieceI === coordsInBoard.length - 1) {
        return pieceI + 1;
      }
      xDifference = coordsInBoard[pieceI + 1][0] - coordsInBoard[pieceI][0];
      yDifference = coordsInBoard[pieceI + 1][1] - coordsInBoard[pieceI][1];

      if (
        xDifference > 1 ||
        xDifference < -1 ||
        yDifference > 1 ||
        yDifference < -1
      ) {
        return pieceI + 1;
      }
      pieceI++;
    }
    return coordsInBoard.length;
  },
  pieceIsEnemy(player, piece) {
    if (player.getPieceIndex(piece) === -1) {
      return piece;
    }
    return false;
  },
  getFarCoords(player, coordsInBoard, piecesFoundI, board) {
    if (!piecesFoundI) {
      return coordsInBoard;
    }

    const movesBeyondPieceI = piecesFoundI.map((pieceI) => {
      return this.findMovesBeyondPieceI(coordsInBoard, pieceI);
    });

    const farCoords = [...coordsInBoard];

    movesBeyondPieceI.forEach((endI, beginI) => {
      this.undefineAToB(piecesFoundI[beginI], endI, farCoords);
    });

    piecesFoundI.forEach((pieceI, iNoRepeat) => {
      if (movesBeyondPieceI[iNoRepeat] !== movesBeyondPieceI[iNoRepeat - 1]) {
        const enemyPieceCoords = this.pieceIsEnemy(
          player,
          board.lookForPiece(coordsInBoard[pieceI][0], coordsInBoard[pieceI][1])
        );

        if (enemyPieceCoords) {
          farCoords.push(enemyPieceCoords.coords);
        }
      }
    });
    return farCoords;
  },
  getShortCoords(player, coordsInBoard, piecesFoundI, board) {
    if (!piecesFoundI) {
      return coordsInBoard;
    }

    piecesFoundI.forEach((pieceI) => {
      if (
        !this.pieceIsEnemy(
          player,
          board.lookForPiece(coordsInBoard[pieceI][0], coordsInBoard[pieceI][1])
        )
      ) {
        coordsInBoard[pieceI] = undefined;
      }
      return;
    });
    return coordsInBoard;
  },
  getPawnCoords(player, coordsInBoard, piecesFoundI, board) {
    let noAllies = this.getShortCoords(
      player,
      coordsInBoard,
      piecesFoundI,
      board
    );

    noAllies = noAllies.filter((coords, i) => {
      if (!coords) {
        return;
      }
      const enemyPiece = this.pieceIsEnemy(
        player,
        board.lookForPiece(coordsInBoard[i][0], coordsInBoard[i][1])
      );
      if (
        coords.twoStraight &&
        (!coordsInBoard[i - 1] ||
          board.lookForPiece(coordsInBoard[i - 1][0], coordsInBoard[i - 1][1]))
      ) {
        return undefined;
      }
      if (
        ((coords.straight || coords.twoStraight) && enemyPiece) ||
        (!coords.straight && !coords.twoStraight && !enemyPiece)
      ) {
        return undefined;
      }
      return coords;
    });

    return noAllies;
  },
  undefineAToB(A, B, arr) {
    while (A !== B) {
      arr[A] = undefined;
      A++;
    }
  },
};

export default function startBoard() {
  const gameBoard = gameboardFactory();

  const whitePlayer = playerFactory("white");
  const blackPlayer = playerFactory("black");

  gameBoard.addPlayer(whitePlayer);
  gameBoard.addPlayer(blackPlayer);

  piecesBox.addPawns(whitePlayer, 1);
  for (const addPieces in piecesBox) {
    if (piecesBox.hasOwnProperty(addPieces) && addPieces !== "addPawns") {
      piecesBox[addPieces](whitePlayer, 0);
    }
  }

  piecesBox.addPawns(blackPlayer, 6);
  for (const addPieces in piecesBox) {
    if (piecesBox.hasOwnProperty(addPieces) && addPieces !== "addPawns") {
      piecesBox[addPieces](blackPlayer, 7);
    }
  }

  whitePlayer.setAllPiecesOnBoard(gameBoard);
  blackPlayer.setAllPiecesOnBoard(gameBoard);

  return gameBoard;
}

const piecesBox = {
  addPawns(player, y) {
    let type;
    if (y === 1) {
      type = "whitePawn";
    } else {
      type = "blackPawn";
    }

    for (let i = 0; i < 8; i++) {
      const pawn = pieceFactory([[i], [y]], type, "getPawnCoords");
      pawn.isNewYPromote = isNewYPromote;
      pawn.promotePiece = promotePiece;
      player.addPiece(pawn);
    }
  },
  addRooks(player, y) {
    const rook = pieceFactory([[0], [y]], "rook", "getFarCoords");
    const rightRook = pieceFactory([[7], [y]], "rook", "getFarCoords");
    player.addPiece(rook);
    player.addPiece(rightRook);
  },
  addKnights(player, y) {
    const knight = pieceFactory([[1], [y]], "knight", "getShortCoords");
    const rightKnight = pieceFactory([[6], [y]], "knight", "getShortCoords");
    player.addPiece(knight);
    player.addPiece(rightKnight);
  },
  addBishops(player, y) {
    const bishop = pieceFactory([[2], [y]], "bishop", "getFarCoords");
    const rightBishop = pieceFactory([[5], [y]], "bishop", "getFarCoords");
    player.addPiece(bishop);
    player.addPiece(rightBishop);
  },
  addKing(player, y) {
    const king = pieceFactory([[4], [y]], "king", "getShortCoords");
    player.addPiece(king);
  },
  addQueen(player, y) {
    const queen = pieceFactory([[3], [y]], "queen", "getFarCoords");
    player.addPiece(queen);
  },
};

function isNewYPromote(newY) {
  if (newY === 7 || newY === 0) {
    return true;
  }
  return false;
}

function promotePiece(promotingTo) {
  delete this.isNewYPromote;
  if (promotingTo === "whitePawn" || promotingTo === "blackPawn") {
    return;
  }
  this.type = promotingTo;
  if (
    promotingTo === "queen" ||
    promotingTo === "rook" ||
    promotingTo === "bishop"
  ) {
    this.finalFilter = "getFarCoords";
    return;
  }
  if (promotingTo === "knight") {
    this.finalFilter = "getShortCoords";
  }
}
