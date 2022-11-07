function gameController (){

    class Gameboard {
        constructor (){
            this.board=[new Array(8),new Array(8),new Array(8),new Array(8),
            new Array(8),new Array(8),new Array(8),new Array(8)];    
            this.table=document.getElementById("board")
            this.players=[]
            this.turn=0;// 0 is white
            }
            cleanDOM(){
                while (this.table.firstChild) {
                    this.table.removeChild(this.table.firstChild);
                  }
            }
            start () {
                let whitePlayer= new Players('white')
                this.players.push(whitePlayer)
                let blackPlayer= new Players('black')
                this.players.push(blackPlayer)
                
                // instructions to create repeating pieces
                let pipe= [[Bishop,'bishop'],[Knight,'knight'],[Rook,'rook']]
                
                //creating pieces for each player
                this.players.forEach((player,i)=>{
                    let y=i?6:1; // toggles y depending on which player to place pawn
                    for (let i=0, x=0; i<8; i++){
                        let pawn=player.createPiece(Pawn,'pawn')
                        player.placePiece(pawn,x+i,y,this.board)
                    }
                    y= i?7:0; // toggles y value to place other pieces
                    let king=player.createPiece(King,'king')
                    player.placePiece(king,4,y,this.board)

                    let queen=player.createPiece(Queen,'queen')
                    player.placePiece(queen,3,y,this.board) 

                    // Queen left side pieces
                    let x=2; 
                        pipe.reduce((prev,creator,i)=>{
                            let piece =player.createPiece(creator[0],creator[1])
                            player.placePiece(piece,x-i,y,this.board)
                        },[]) 
                    // King right side pieces
                    x=5;
                        pipe.reduce((prev,creator,i)=>{
                        let piece =player.createPiece(creator[0],creator[1])
                        player.placePiece(piece,x+i,y,this.board)
                    },[]) 
                })
                setTimeout(()=> {this.changeTurn()},0);
            }   //make turn logic?
            render() {
                
                let isGreen=false;
                for (let x=0; x<8; x++) {
                    let tableRow=document.createElement("tr")
                    tableRow.setAttribute("class","tableRow")
                        for(let y=0;y<8; y++) {
                            let cell = document.createElement("td");
                            cell.setAttribute(`data-coords`, `${x}${y}`);
                            cell.classList.add('board-square')
                            //changing color
                            if (!isGreen) {
                                cell.classList.add('white')
                                isGreen=true;
                            } else {
                                cell.classList.add('green')
                                isGreen=false;
                            }
                            //displaying piece image
                            if (this.board[x][y]) {
                                let img=document.createElement('img');
                                img.setAttribute('src',this.board[x][y].image)
                                img.classList.add('pieceImg')
                                cell.appendChild(img)
                            }
                            tableRow.appendChild(cell);
                        }
                    isGreen= !isGreen;
                    this.table.appendChild(tableRow);
                }
            }
            checkForWin(){
                
            }
            changeTurn (){
                if(this.turn===1) {
                    this.players[1].humanCanClick(this.board)
                    this.turn=0
                }else{
                    this.turn=1
                    this.players[0].humanCanClick(this.board)

                }
            }
            
        }
        class Players {
            constructor(color) {
                this.color=color
                this.human=false;
                this.pieces=[]
            }

            humanCanClick(board){
                    this.pieces.forEach((item)=>{
                    let piece=document.querySelector(`[data-coords="${item.coords[0]}${item.coords[1]}"]`)
                    piece.classList.add('clickablePiece')
                    piece.addEventListener('click', ()=>{
                        console.log(item)
                        // It'd be easier to get the element clicked by using e.target
                        this.displayPossibilities(item,board)
                    })
                })
            }
            displayPossibilities(item,board){
                //clear previous attacks display.
                this.clearPossibilities();

                // add grey marker for each possible move
                let coords=`${item.coords[0]}${item.coords[1]}`
                let possibleMoves=item.getPossibleMoves(coords,board)
                    for (let i=0; i<possibleMoves.length;i++){
                        let coord=possibleMoves[i]
                        let square=document.querySelector(`[data-coords="${coord[0]}${coord[1]}"]`);
                        let grey= document.createElement('div');
                        grey.classList.add('grey');
                        square.appendChild(grey)
                    }
                
            }
            clearPossibilities(){
                //clear attacks display
                let possible=document.querySelectorAll('.grey')
                for (let i =0; i<possible.length; i++){
                    possible[i].parentElement.removeChild(possible[i])
                }
            }
            createPiece(Class,type){
                let newPiece= new Class(type,this.color)
                this.pieces.push(newPiece)
                return newPiece
            }
            placePiece(piece,x,y,board) {
                piece.coords=[x,y]
                board[x][y]=piece
            }
            chooseAttack() {
                
            }
        }
        class Pieces{
            constructor(type,color) {
                this.type=type;
                this.color=color;
                this.image=`../../public/images/pieces/${color} ${type}.png`;
            }
            checkIfEmpty (x,y, board) {
                return board[x][y]===undefined?true: false;
            }
            checkIfEnemy (x,y,board) {
                console.log(this.color,board[x][y].color)
                return board[x][y].color!==this.color?true:false;               
            }
            move() {
                
            }
            explode(){

            }
            
        }
        class Knight extends Pieces {
            constructor(type,color) {
            super (type,color)
            }
            getPossibleMoves (coords,board) {
                let x = parseInt(coords[0], 10);
                let y = parseInt(coords[1], 10);
                let possibilities = [[x+1, y+2],[x+2,y+1],[x-1,y+2], [x-2,y+1], [x+1,y-2],[x+2,y-1], [x-2, y-1], [x-1,y-2]];
                //validating moves
                return possibilities.reduce((moves,possibility)=> {
                    //check if move possibility is inside bounds.
                    if (possibility[0] <= 7 && possibility[0]>=0 && possibility[1]<=7 && possibility[1]>=0){
                        //checks if square is empty or with enemy piece

                        if (this.checkIfEmpty(possibility[0],possibility[1],board) || 
                            this.checkIfEnemy(possibility[0],possibility[1],board)) {
                            moves.push(possibility)
                        } 
                    }
                    return moves;
                },[])

            }
        }

        class King extends Pieces {
            constructor(type,color) {
                super (type,color)
                this.start=true;
            }
            getPossibleMoves (coords,board) {
                let x = parseInt(coords[0], 10);
                let y = parseInt(coords[1], 10);
                let possibilities = [[x+1, y], [x+1, y+1], [x,y-1], [x-1,y], [x-1, y+1], [x-1, y-1], [x, y+1], [x, y-1]];
                //validating moves
                let legalMoves= possibilities.reduce((moves,possibility)=> {
                    //check if move possibility is inside bounds.
                    if (possibility[0] <= 7 && possibility[0]>=0 && possibility[1]<=7 && possibility[1]>=0){
                        //checks if square is empty or with enemy piece
                        if (this.checkIfEmpty(possibility[0],possibility[1],board) || (
                            this.checkIfEnemy(possibility[0],possibility[1],board)
                        )) {
                            moves.push(possibility)
                        } 
                    }
                    return moves;
                },[])
                //checking if space between king/rook is empty and adding castle possibility
                if (this.start && this.checkIfEmpty(x+2,y,board) && this.checkIfEmpty(x+1,y,board) && board[x + 3][y] && board[x + 3][y].start) {
                    legalMoves.push([x+3,y])
                }
                if (this.start && this.checkIfEmpty(x-1,y,board) && this.checkIfEmpty(x-2,y,board) && this.checkIfEmpty(x-3,y,board) && board[x - 4][y]!==undefined && board[x -4][y].start) {
                    legalMoves.push([x-4,y])
                }
                return legalMoves;
            }
        }

        class Rook extends Pieces {
            constructor(type, color){
                super (type,color) 
            }

             getPossibleMoves (coords,board) {
                let x = parseInt(coords[0], 10);
                let y = parseInt(coords[1], 10);
                let possibilities=[];
                //going up
                for (let i=1; y+i<8; i++) {
                     if (this.checkIfEmpty(x,y+i,board)) {
                        possibilities.push([x, y+i])
                    } else if (this.checkIfEnemy(x,y+i,board)){
                        possibilities.push([x, y+i]);
                        //after pushing stop loop if piece is the enemy
                        i=8
                    } else {i=8;}
                    //stop loop and dont push after seing an ally piece
                }
                //going down
                for (let i=1; y-i>-1; i++) {
                    if (this.checkIfEmpty(x,y-i,board)) {
                        possibilities.push([x, y-i])
                    } else if (this.checkIfEnemy(x,y-i,board)){
                        possibilities.push([x, y-i]);
                        i=8
                    } else {i=8;}
                }

                //going right
                for (let i=1; x+i<8; i++) {
                    if (this.checkIfEmpty(x+i,y,board)) {
                        possibilities.push([x+i, y])
                    } else if (this.checkIfEnemy(x+i,y,board)){
                        possibilities.push([x+i, y]);
                        i=8
                    } else {i=8;}
                }
               //going left
               for (let i=1; x-i>-1; i++) {
                if (this.checkIfEmpty(x-i,y,board)) {
                    possibilities.push([x-i, y])
                } else if (this.checkIfEnemy(x-i,y,board)){
                    possibilities.push([x-i, y]);
                     i=8
                } else {i=8;}
            }
                 return possibilities
            }
        }

        class Bishop extends Pieces{
            constructor(type,color){
                super(type,color)
            }

             getPossibleMoves(coords,board){
                //same logic as rook
                let x = parseInt(coords[0], 10);
                let y = parseInt(coords[1], 10);
                let possibilities=[];
                //up-right
                for (let i=1; x+i<8 && y+i<8; i++) {
                    if (this.checkIfEmpty(x+i,y+i,board)) {
                        possibilities.push([x+i,y+i])
                    } else if (this.checkIfEnemy(x+i,y+i,board)){
                        possibilities.push([x+i,y+i]);
                        //after pushing stop loop if piece is the enemy
                        i=8
                    } else {
                        //stop loop and dont push after seing an ally piece
                        i=8;}
                }
                //down-right
                for (let i=1; x+i<8 && y-i>-1; i++) {
                    if (this.checkIfEmpty(x+i,y-i,board)) {
                        possibilities.push([x+i,y-i])
                    } else if (this.checkIfEnemy(x+i,y-i,board)){
                        possibilities.push([x+i,y-i]);
                    i=8
                    } else {
                                                i=8;}
                }
            
                //up-left
                for (let i=1; x-i>-1 && y+i<8; i++) {
                    if (this.checkIfEmpty(x-i,y+i,board)) {
                        possibilities.push([x-i,y+i])
                    } else if (this.checkIfEnemy(x-i,y+i,board)){
                        possibilities.push([x-i,y+i]);
                    i=8
                    } else {
                                                i=8;}
                }
                //down-left
                for (let i=1; x-i>-1 && y-i>-1; i++) {
                    if (this.checkIfEmpty(x-i,y-i,board)) {
                        possibilities.push([x-i,y-i])
                    } else if (this.checkIfEnemy(x-i,y-i,board)){
                        possibilities.push([x-i,y-i]);
                    i=8
                    } else {
                                                i=8;}
                }
                return possibilities;
            }

        }
        class Queen extends Pieces {
            constructor(type,color) {
                super(type,color)
                this.rookMoves=Rook.prototype.getPossibleMoves;
                this.bishopMoves=Bishop.prototype.getPossibleMoves;
            }
            getPossibleMoves(coords,board) {
                let legalMoves=[]
                //combine rook and bishop moves to make queen

                this.rookMoves(coords,board).forEach((item)=>{
                    legalMoves.push(item)
                })
                this.bishopMoves(coords,board).forEach((item)=>{
                    legalMoves.push(item)
                })
                return legalMoves;
            }
        }

        class Pawn extends Pieces {
            constructor(type,color) {
                super(type,color)
                this.start=true;
            }
            getPossibleMoves(coords,board){
                let x = parseInt(coords[0], 10);
                let y = parseInt(coords[1], 10);
                let possibilities = {
                    white: [[x,y+1],[x+1,y+1],[x-1,y+1]],
                    black: [[x,y-1],[x+1,y-1],[x-1,y-1]],
                };
                //basic moves, going straight into ++y or --y or capturing.
                let allMoves= possibilities[this.color].reduce((prev,coord,i)=>{
                    //check if in bounds
                    if (coord[0]<8 && coord[0]>-1 && coord[1]<8 && coord[1]>-1){
                        if (this.checkIfEmpty(coord[0],coord[1],board)) {
                            // pushing only if moving straight
                            if (i===0){prev.push([coord[0],coord[1]])}
                        }else if (this.checkIfEnemy(coord[0],coord[1],board)){
                            //if not empty, check if enemy, pushing if It is
                            prev.push([coord[0],coord[1]])
                        }
                    }
                    return prev
                },[])
                //special rules : 2 squares move
                if (this.start && this.color==='white' && this.checkIfEmpty(x,y+1,board) && this.checkIfEmpty(x,y+2,board)) {
                    allMoves.push([x,y+2])
                }
                if (this.start && this.color==='black' && this.checkIfEmpty(x,y-1,board) && this.checkIfEmpty(x,y-2,board)) {
                    allMoves.push([x,y-2])
                }
                //special rules : en pasant attack
                if (this.checkIfEnpasant(x+1,y,board)) {
                    allMoves.push([])
                }


                return allMoves
            }

            checkIfEnpasant(x,y,board) {
                if (x>-1 && x<8 && y>-1 && y<8 && board[x][y]!== undefined && board[x][y].enpasant && board[x][y].color!==this.color){
                    return true
                }
                return false
            }

            promote (){

            }
        }
    
        return {Gameboard,Knight,King, Rook, Bishop, Queen,Pawn}
    }

export default gameController;