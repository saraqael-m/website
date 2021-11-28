var bigBoard = [[0,0,0],[0,0,0],[0,0,0]];
var smallBoard = [[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]],[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]],[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]]]
var currentPlayer = -1;
var playerMarker = -1;
var lastMove;
var currentPlayerText = document.getElementById("current_player");
var currentBoard = [null, null];
var winner = 0;
var recursionDepth;
var currentMinimaxPlayer;
var minimaxWinner;
var currentMinimaxBoard;
var diffSlider = document.getElementById("com_diff_slider");
var sliderIsActive = true;
var maxRecursionDepth = diffSlider.value*2;
const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);


function posClicked(btn, markerPos) {
	if (sliderIsActive) {
		diffSlider.disabled = true;
		sliderIsActive = false;
	}
	if (currentPlayer == playerMarker && isPosValid(markerPos) && winner == 0) {
		placeMarker(markerPos, playerMarker, btn, true);
		currentPlayer *= -1;
		computerMove();
	}
}

function diffSliderChanged(value) {
	maxRecursionDepth = value*3
}

function placeMarker(markerPos, markerType, btn, isNew) {
	//setting variables
	smallBoard[markerPos[0]][markerPos[1]][markerPos[2]][markerPos[3]] = markerType;
	bigBoard[markerPos[0]][markerPos[1]] = isBoardWon(smallBoard[markerPos[0]][markerPos[1]]);
	if (btn != undefined) {
		if (isNew) {
			if (lastMove != undefined) {
				placeMarker(lastMove[0], lastMove[1], lastMove[2], false);
			}
			lastMove = [markerPos, markerType, btn];
		}
		winner = isBoardWon(bigBoard);
		if (bigBoard[markerPos[2]][markerPos[3]] == 0) {
			currentBoard = [markerPos[2], markerPos[3]];
		} else {
			currentBoard = [null, null];
		}
		//outputting to website
		drawMarker(markerPos, markerType, btn, isNew);
	} else {
		if (bigBoard[markerPos[2]][markerPos[3]] == 0) {
			currentMinimaxBoard = [markerPos[2], markerPos[3]];
		} else {
			currentMinimaxBoard = [null, null];
		}
	}

}

function drawMarker(markerPos, markerType, btn, isNew) {
	let upperTable = btn.parentElement.parentElement.parentElement;
	upperTable.id = "big_table"; //remove highlighting
	if (currentBoard[0] != null && winner == 0) {
		upperTable.parentElement.parentElement.parentElement.parentElement.children[currentBoard[0]].children[currentBoard[1]].children[0].children[0].id = "big_table_selected";
	}
	let extension = "";
	if (isNew) {
		extension = "New";
	}
	if (markerType == 1) {
		btn.firstChild.src = "markers/circle"+extension+".png";
		currentPlayerText.innerHTML = "cross (player)";
		currentPlayerText.style = "color: blue;";
	} else if (markerType == -1) {
		btn.firstChild.src = "markers/cross"+extension+".png";
		currentPlayerText.innerHTML = "circle (com)";
		currentPlayerText.style = "color: red;";
	}
	if (bigBoard[markerPos[0]][markerPos[1]] == 1) {
		upperTable.id = "big_table_circle";
	} else if (bigBoard[markerPos[0]][markerPos[1]] == -1) {
		upperTable.id = "big_table_cross";
	}
	if (winner != 0) {
		won()
	}
}

function computerMove() {
	recursionDepth = 0;
	currentMinimaxPlayer = -playerMarker;
	minimaxWinner = 0;
	currentMinimaxBoard = currentBoard.slice();
	let markerPos = minimax(-4, 4, 1)[1];
	placeMarker(markerPos, -1*playerMarker, document.getElementsByTagName("button")[27*markerPos[0]+9*markerPos[1]+3*markerPos[2]+1*markerPos[3]], true);
	currentPlayer *= -1;
}

function minimax(alpha, beta, minimaxType) {
	minimaxWinner = isBoardWon(bigBoard);
	if (minimaxWinner != 0) {
		if (minimaxWinner == null) {
			return [0, [0,0,0,0]];
		}
		return [-3*minimaxWinner*playerMarker, [0,0,0,0]];
	}
	recursionDepth++;
	if (recursionDepth >= maxRecursionDepth) {
		recursionDepth--;
		return [-1*evaluateBoardState()*playerMarker, [0,0,0,0]];
	}
	let extremeVal = -4*minimaxType;
	let pos = [null, null, null, null];
	let possibleMoves = [];
	let prevCurrentBoard = currentMinimaxBoard.slice();
	if (currentMinimaxBoard[0] != null) {
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				if (smallBoard[currentMinimaxBoard[0]][currentMinimaxBoard[1]][x][y] == 0) {
					possibleMoves.push([currentMinimaxBoard[0],currentMinimaxBoard[1],x,y]);
				}
			}
		}
	} else {
		for (let x1 = 0; x1 < 3; x1++) {
			for (let y1 = 0; y1 < 3; y1++) {
				if (bigBoard[x1][y1] == 0) {
					for (let x2 = 0; x2 < 3; x2++) {
						for (let y2 = 0; y2 < 3; y2++) {
							if (smallBoard[x1][y1][x2][y2] == 0) {
								possibleMoves.push([x1, y1, x2, y2]);
							}
						}
					}
				}
			}
		}
	}
	let currentMove;
	for (let i = 0; i < possibleMoves.length; i++) {
		currentMove = possibleMoves[i].slice()
		currentMinimaxBoard = prevCurrentBoard;
		placeMarker(currentMove, -1*playerMarker*minimaxType);
		let m = minimax(alpha, beta, -1*minimaxType)[0];
		if (m*minimaxType > extremeVal*minimaxType) {
			extremeVal = m;
			pos = currentMove.slice();
		}
		placeMarker(currentMove, 0);
		if (minimaxType == 1) { //alpha-beta pruning
			if (extremeVal >= beta) {
				recursionDepth--;
				return [extremeVal, pos];
			}
			if (extremeVal > alpha) {
				alpha = extremeVal;
			}
		} else {
			if (extremeVal <= alpha) {
				recursionDepth--;
				return [extremeVal, pos];
			}
			if (extremeVal < beta) {
				beta = extremeVal;
			}
		} 
	}
	recursionDepth--;
	return [extremeVal, pos];
}

function evaluateBoardState() {
	let almostWinSum = 0;
	let sumList;
	for (let x = 0; x < 3; x++) {
		for (let y = 0; y < 3; y++) {
			if (bigBoard[x][y] == 0) {
				sumList = getSumList(smallBoard[x][y]);
				almostWinSum += countOccurrences(sumList, 2) - countOccurrences(sumList, -2);
			}
		}
	}
	sumList = getSumList(bigBoard);
	almostWinSum += (countOccurrences(sumList, 2) - countOccurrences(sumList, -2))*9;
	return (bigBoard.flat().reduce((a, b) => a + b, 0)/9) + (almostWinSum/60);
}

function isPosValid(markerPos) {
	if (bigBoard[markerPos[0]][markerPos[1]] == 0 && smallBoard[markerPos[0]][markerPos[1]][markerPos[2]][markerPos[3]] == 0) {
		if (currentBoard[0] == null) {
			return true;
		} else if (currentBoard[0] == markerPos[0] && currentBoard[1] == markerPos[1]) {
			return true;
		}
	}
	return false;
}

function isBoardWon(board) {
	let sumList = getSumList(board);
	if (sumList.includes(-3)) {
		// cross won board
		return -1;
	} else if (sumList.includes(3)) {
		// circle won board
		return 1;
	}
	if ( board.reduce(function(a,b) { return a.concat(b) }).includes(0) ) {
		return 0;
	}
	return null;
}

function getSumList(board) {
	let sumList = [board[0][0]+board[1][1]+board[2][2], board[2][0]+board[1][1]+board[0][2]];
	sumList.push.apply(sumList, board.map(r => r.reduce((a, b) => a + b)));
	sumList.push.apply(sumList, board.reduce((a, b) => a.map((x, i) => x + b[i])));
	return sumList;
}

function won() {
	if (winner == 1) {
		currentPlayerText.innerHTML = "CIRCLE (COM) WON!";
		currentPlayerText.style = "color: red;";
	} else if (winner == -1) {
		currentPlayerText.innerHTML = "CROSS (PLAYER) WON!";
		currentPlayerText.style = "color: blue;";
	} else if (winner == null) {
		currentPlayerText.innerHTML = "TIE!";
		currentPlayerText.style = "color: white;";
	}
}

function reset() {
	bigBoard = [[0,0,0],[0,0,0],[0,0,0]];
	smallBoard = [[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]],[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]],[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]]]
	currentPlayer = -1;
	currentBoard = [null, null];
	winner = 0;
	let markerBtns = document.getElementsByClassName("marker_btn")
	for (let i = 0; i < markerBtns.length; i++) {
		markerBtns[i].firstChild.src = "markers/blank.png"
	}
	let markerTables = document.getElementsByClassName("big_board")
	for (let i = 0; i < markerTables.length; i++) {
		markerTables[i].children[0].id = "big_table"
	}
	currentPlayerText.innerHTML = "cross (player)";
	currentPlayerText.style = "color: blue;";
	if (sliderIsActive == false) {
		diffSlider.disabled = false;
		sliderIsActive = true;
	}
}