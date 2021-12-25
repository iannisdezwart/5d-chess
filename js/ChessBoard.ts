/**
 * 5D chess board. Holds the pieces, a reference to the previous board,
 * and references to the next boards.
 */
class ChessBoard
{
	boardMap: ChessBoardMap
	boardMapPos: number[]

	board: ChessPiece[][]

	next: ChessBoard[]
	player: Colour

	boardEl: HTMLElement
	draggingPiece: HTMLElement = null
	draggingPieceSquare: number[] = null

	legalStuff: ChessBoardLegalStuff

	constructor(boardMap: ChessBoardMap, boardMapPos: number[],
		board: ChessPiece[][], player: Colour)
	{
		this.boardMap = boardMap
		this.boardMapPos = boardMapPos

		this.board = board

		this.next = []
		this.player = player
	}

	translatePointerPositionToSquare(x: number, y: number)
	{
		if (this.player == Colour.White)
		{
			return [ x, 7 - y ]
		}
		else
		{
			return [ 7 - x, y ]
		}
	}

	pieceAt(x: number, y: number)
	{
		if (this.player == Colour.White)
		{
			return this.board[y][x]
		}
		else
		{
			return this.board[7 - y][7 - x]
		}
	}

	setAt(x: number, y: number, piece: ChessPiece)
	{
		this.board[y][x] = piece
	}

	decodeCoord(coord: string)
	{
		const x = coord.charCodeAt(0) - 'a'.charCodeAt(0)
		const y = coord.charCodeAt(1) - '1'.charCodeAt(0)

		return [ x, y ]
	}

	squareColour(x: number, y: number)
	{
		if ((x + y) % 2 == 0)
		{
			return Colour.Black
		}

		return Colour.White
	}

	set(coord: string, pieceType: ChessPieceType, colour: Colour)
	{
		const [ x, y ] = this.decodeCoord(coord)

		this.board[y][x] = new ChessPiece(pieceType, colour)
	}

	clonePieces()
	{
		const pieces: ChessPiece[][] = []

		for (let y = 0; y < 8; y++)
		{
			pieces[y] = []

			for (let x = 0; x < 8; x++)
			{
				pieces[y][x] = this.board[y][x]
			}
		}

		return pieces
	}

	clone()
	{
		return this.boardMap.clone(this)
	}

	move(xFrom: number, yFrom: number, xTo: number, yTo: number)
	{
		if (!this.legalStuff.isLegal(xFrom, yFrom, xTo, yTo))
		{
			return
		}

		const newBoard = this.clone()
		const movedPiece = newBoard.board[yFrom][xFrom]

		newBoard.board[yTo][xTo] = newBoard.board[yFrom][xFrom]
		newBoard.board[yFrom][xFrom] = null

		// Castling

		if (movedPiece.is(Colour.White, ChessPieceType.King) && xTo - xFrom == 2)
		{
			newBoard.board[yTo][3] = new ChessPiece(ChessPieceType.Rook, Colour.White)
			newBoard.board[yTo][0] = null
		}

		if (movedPiece.is(Colour.White, ChessPieceType.King) && xFrom - xTo == 2)
		{
			newBoard.board[yTo][5] = new ChessPiece(ChessPieceType.Rook, Colour.White)
			newBoard.board[yTo][7] = null
		}

		if (movedPiece.is(Colour.Black, ChessPieceType.King) && xTo - xFrom == 2)
		{
			newBoard.board[yTo][3] = new ChessPiece(ChessPieceType.Rook, Colour.Black)
			newBoard.board[yTo][0] = null
		}

		if (movedPiece.is(Colour.Black, ChessPieceType.King) && xFrom - xTo == 2)
		{
			newBoard.board[yTo][5] = new ChessPiece(ChessPieceType.Rook, Colour.Black)
			newBoard.board[yTo][7] = null
		}

		// Keep track of castling legality

		if (movedPiece.is(Colour.White, ChessPieceType.King))
		{
			newBoard.legalStuff.whiteKingMoved = true
		}

		if (!newBoard.legalStuff.whiteLeftRookMoved
			&& movedPiece.is(Colour.White, ChessPieceType.Rook)
			&& xFrom == 0 && newBoard.pieceAt(7, 0) == null)
		{
			newBoard.legalStuff.whiteLeftRookMoved = true
		}

		if (!newBoard.legalStuff.whiteRightRookMoved
			&& movedPiece.is(Colour.White, ChessPieceType.Rook)
			&& xFrom == 7 && newBoard.pieceAt(0, 0) == null)
		{
			newBoard.legalStuff.whiteRightRookMoved = true
		}

		if (movedPiece.is(Colour.Black, ChessPieceType.King))
		{
			newBoard.legalStuff.blackKingMoved = true
		}

		if (!newBoard.legalStuff.blackLeftRookMoved
			&& movedPiece.is(Colour.Black, ChessPieceType.Rook)
			&& xFrom == 0 && newBoard.pieceAt(0, 7) == null)
		{
			newBoard.legalStuff.blackLeftRookMoved = true
		}

		if (!newBoard.legalStuff.blackRightRookMoved
			&& movedPiece.is(Colour.Black, ChessPieceType.Rook)
			&& xFrom == 7 && newBoard.pieceAt(7, 7) == null)
		{
			newBoard.legalStuff.blackRightRookMoved = true
		}

		// En passant

		if (this.player == Colour.White)
		{
			this.legalStuff.whiteEnPassant = Array(8).fill(false)
		}
		else
		{
			this.legalStuff.blackEnPassant = Array(8).fill(false)
		}

		if (movedPiece.is(Colour.White, ChessPieceType.Pawn)
			&& yTo - yFrom == 2)
		{
			this.legalStuff.whiteEnPassant[xFrom] = true;
		}

		if (movedPiece.is(Colour.Black, ChessPieceType.Pawn)
			&& yFrom - yTo == 2)
		{
			this.legalStuff.blackEnPassant[xFrom] = true;
		}

		if (movedPiece.is(Colour.White, ChessPieceType.Pawn)
			&& this.legalStuff.blackEnPassant[xFrom]
			&& xTo != xFrom)
		{
			this.board[yFrom][xTo] = null
		}

		if (movedPiece.is(Colour.Black, ChessPieceType.Pawn)
			&& this.legalStuff.whiteEnPassant[xFrom]
			&& xTo != xFrom)
		{
			this.board[yFrom][xTo] = null
		}

		// Pawn promotion

		if (movedPiece.is(Colour.White, ChessPieceType.Pawn) && yTo == 7)
		{
			// Todo: show promotion prompt.

			const promotion = ChessPieceType.Queen as ChessPieceType

			switch (promotion)
			{
				case ChessPieceType.Queen:
				{
					newBoard.board[yTo][xTo] = new ChessPiece(
						ChessPieceType.Queen, Colour.White)
					break
				}

				case ChessPieceType.Rook:
				{
					newBoard.board[yTo][xTo] = new ChessPiece(
						ChessPieceType.Rook, Colour.White)
					break
				}

				case ChessPieceType.Bishop:
				{
					newBoard.board[yTo][xTo] = new ChessPiece(
						ChessPieceType.Bishop, Colour.White)
					break
				}

				case ChessPieceType.Knight:
				{
					newBoard.board[yTo][xTo] = new ChessPiece(
						ChessPieceType.Knight, Colour.White)
					break
				}
			}
		}

		if (movedPiece.is(Colour.Black, ChessPieceType.Pawn) && yTo == 0)
		{
			// Todo: show promotion prompt.

			const promotion = ChessPieceType.Queen as ChessPieceType

			switch (promotion)
			{
				case ChessPieceType.Queen:
				{
					newBoard.board[yTo][xTo] = new ChessPiece(
						ChessPieceType.Queen, Colour.Black)
					break
				}

				case ChessPieceType.Rook:
				{
					newBoard.board[yTo][xTo] = new ChessPiece(
						ChessPieceType.Rook, Colour.Black)
					break
				}

				case ChessPieceType.Bishop:
				{
					newBoard.board[yTo][xTo] = new ChessPiece(
						ChessPieceType.Bishop, Colour.Black)
					break
				}

				case ChessPieceType.Knight:
				{
					newBoard.board[yTo][xTo] = new ChessPiece(
						ChessPieceType.Knight, Colour.Black)
					break
				}
			}
		}

		this.boardMap.update()

		return newBoard
	}

	render()
	{
		this.boardEl = document.createElement('div')
		this.boardEl.classList.add('board')

		for (let y = 7; y >= 0; y--)
		{
			const row = document.createElement('div')
			row.classList.add('board-row')

			for (let x = 0; x < 8; x++)
			{
				const cell = document.createElement('div')
				cell.classList.add('board-cell')

				if (this.squareColour(x, y) == Colour.Black)
				{
					cell.innerHTML += /* html */ `
					<div class='square'>
						<img src='/res/svg/board/dark-square.svg'>
					</div>
					`
				}
				else
				{
					cell.innerHTML += /* html */ `
					<div class='square'>
						<img src='/res/svg/board/light-square.svg'>
					</div>
					`
				}

				if (this.pieceAt(x, y) != null)
				{
					// Todo: check if the piece is selectable.

					cell.innerHTML += /* html */ `
					<div class='selectable piece'>
						${ this.pieceAt(x, y).svg() }
					</div>
					`
				}

				row.appendChild(cell)
			}

			this.boardEl.appendChild(row)
		}

		this.boardEl.addEventListener('mousedown', this.mouseDownHandler.bind(this))
		this.boardEl.addEventListener('touchstart', this.mouseDownHandler.bind(this))

		this.boardEl.addEventListener('mousemove', this.mouseMoveHandler.bind(this))
		this.boardEl.addEventListener('touchmove', this.mouseMoveHandler.bind(this))

		this.boardEl.addEventListener('mouseup', this.mouseUpHandler.bind(this))
		this.boardEl.addEventListener('toucheend', this.mouseUpHandler.bind(this))

		return this.boardEl
	}

	pointedSquare(e: MouseEvent)
	{
		const boardRect = this.boardEl.getBoundingClientRect()
		const { clientX, clientY } = e

		const x = Math.floor((clientX - boardRect.x) / boardRect.width * 8)
		const y = Math.floor((clientY - boardRect.y) / boardRect.height * 8)

		return this.translatePointerPositionToSquare(x, y)
	}

	getSquare(x: number, y: number)
	{
		const sq = this.translatePointerPositionToSquare(x, y)
		return this.boardEl.children[sq[1]].children[sq[0]]
	}

	mouseDownHandler(e: MouseEvent)
	{
		const target = e.target as HTMLElement

		if (!target.classList.contains('piece'))
		{
			return
		}

		this.draggingPiece = target
		this.draggingPieceSquare = this.pointedSquare(e)

		const xFrom = this.draggingPieceSquare[0]
		const yFrom = this.draggingPieceSquare[1]
		const legalMoves = this.legalStuff.possibleMoves(xFrom, yFrom, true)

		for (const { x, y } of legalMoves)
		{
			console.log(x, y)
			const square = this.getSquare(x, y)

			square.classList.add('legal-move')
		}
	}

	mouseMoveHandler(e: MouseEvent)
	{
		if (this.draggingPiece == null)
		{
			return
		}

		const { clientX, clientY } = e
		const img = this.draggingPiece.querySelector<HTMLImageElement>('img')
		const rect = this.draggingPiece.getBoundingClientRect()

		const middleX = rect.x + rect.width / 2
		const middleY = rect.y + rect.height / 2

		const x = (clientX - middleX) / rect.width * 100
		const y = (clientY - middleY) / rect.height * 100

		img.style.transform = `translate(${ x }%, ${ y }%)`
		img.style.zIndex = '1'
	}

	mouseUpHandler(e: MouseEvent)
	{
		if (this.draggingPiece == null)
		{
			return
		}

		const [ xFrom, yFrom ] = this.draggingPieceSquare
		const [ xTo, yTo ] = this.pointedSquare(e)

		const img = this.draggingPiece.querySelector<HTMLImageElement>('img')

		img.style.transform = null
		img.style.zIndex = null
		this.draggingPiece = null

		for (const square of [].slice.call(this.boardEl.querySelectorAll('.legal-move')))
		{
			square.classList.remove('legal-move')
		}

		if (xFrom == xTo && yFrom == yTo)
		{
			return
		}

		this.move(xFrom, yFrom, xTo, yTo)
	}

	static empty(boardMap: ChessBoardMap, boardMapPos: number[],
		player: Colour)
	{
		const board = new ChessBoard(boardMap, boardMapPos, [], player)

		for (let y = 0; y < 8; y++)
		{
			board.board.push(new Array(8).fill(null))
		}

		return board
	}

	static generateDefault(boardMap: ChessBoardMap, boardMapPos: number[],
		player: Colour)
	{
		const board = ChessBoard.empty(boardMap, boardMapPos, player)

		// White back rank.

		board.set('a1', ChessPieceType.Rook, Colour.White)
		board.set('b1', ChessPieceType.Knight, Colour.White)
		board.set('c1', ChessPieceType.Bishop, Colour.White)
		board.set('d1', ChessPieceType.Queen, Colour.White)
		board.set('e1', ChessPieceType.King, Colour.White)
		board.set('f1', ChessPieceType.Bishop, Colour.White)
		board.set('g1', ChessPieceType.Knight, Colour.White)
		board.set('h1', ChessPieceType.Rook, Colour.White)

		// White pawn rank.

		for (const coord of [ 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2' ])
		{
			board.set(coord, ChessPieceType.Pawn, Colour.White)
		}


		// Black pawn rank.

		for (const coord of [ 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7' ])
		{
			board.set(coord, ChessPieceType.Pawn, Colour.Black)
		}

		// Black back rank.

		board.set('a8', ChessPieceType.Rook, Colour.Black)
		board.set('b8', ChessPieceType.Knight, Colour.Black)
		board.set('c8', ChessPieceType.Bishop, Colour.Black)
		board.set('d8', ChessPieceType.Queen, Colour.Black)
		board.set('e8', ChessPieceType.King, Colour.Black)
		board.set('f8', ChessPieceType.Bishop, Colour.Black)
		board.set('g8', ChessPieceType.Knight, Colour.Black)
		board.set('h8', ChessPieceType.Rook, Colour.Black)

		return board
	}
}