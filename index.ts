enum ChessPieceType
{
	King,
	Queen,
	Rook,
	Bishop,
	Knight,
	Pawn
}

enum Colour
{
	White,
	Black
}

/**
 * Combination of chess piece type and colour.
 */
class ChessPiece
{
	type: ChessPieceType
	colour: Colour

	constructor(type: ChessPieceType, colour: Colour)
	{
		this.type = type
		this.colour = colour
	}

	svg()
	{
		if (this.colour == Colour.White)
		{
			switch (this.type)
			{
				case ChessPieceType.King:
				{
					return /* html */ `
					<img src="/res/svg/pieces/white/king.svg">
					`
				}

				case ChessPieceType.Queen:
				{
					return /* html */ `
					<img src="/res/svg/pieces/white/queen.svg">
					`
				}

				case ChessPieceType.Rook:
				{
					return /* html */ `
					<img src="/res/svg/pieces/white/rook.svg">
					`
				}

				case ChessPieceType.Bishop:
				{
					return /* html */ `
					<img src="/res/svg/pieces/white/bishop.svg">
					`
				}

				case ChessPieceType.Knight:
				{
					return /* html */ `
					<img src="/res/svg/pieces/white/knight.svg">
					`
				}

				case ChessPieceType.Pawn:
				{
					return /* html */ `
					<img src="/res/svg/pieces/white/pawn.svg">
					`
				}
			}
		}

		switch (this.type)
		{
			case ChessPieceType.King:
			{
				return /* html */ `
				<img src="/res/svg/pieces/black/king.svg">
				`
			}

			case ChessPieceType.Queen:
			{
				return /* html */ `
				<img src="/res/svg/pieces/black/queen.svg">
				`
			}

			case ChessPieceType.Rook:
			{
				return /* html */ `
				<img src="/res/svg/pieces/black/rook.svg">
				`
			}

			case ChessPieceType.Bishop:
			{
				return /* html */ `
				<img src="/res/svg/pieces/black/bishop.svg">
				`
			}

			case ChessPieceType.Knight:
			{
				return /* html */ `
				<img src="/res/svg/pieces/black/knight.svg">
				`
			}

			case ChessPieceType.Pawn:
			{
				return /* html */ `
				<img src="/res/svg/pieces/black/pawn.svg">
				`
			}
		}
	}
}

/**
 * Class representing the map of all chess boards.
 * Holds the entire 5D map of individual chess boards.
 */
class ChessBoardMap
{
	root: ChessBoard
	map: ChessBoard[][] = []
	minTimeline = 0

	constructor(player: Colour)
	{
		this.root = ChessBoard.generateDefault(this, player, 0)
		this.map = [ [ this.root ] ]
	}

	get(x: number, y: number)
	{
		return this.map[y - this.minTimeline][x]
	}

	render(mapEl: HTMLElement)
	{
		this.root.render(mapEl)
	}
}

/**
 * 5D chess board. Holds the pieces, a reference to the previous board,
 * and references to the next boards.
 */
class ChessBoard
{
	boardMap: ChessBoardMap

	board: ChessPiece[][]
	timeline: number

	next: ChessBoard[]
	player: Colour

	boardEl: HTMLElement
	draggingPiece: HTMLElement = null
	draggingPieceSquare: number[] = null

	constructor(boardMap: ChessBoardMap, board: ChessPiece[][],
		player: Colour, timeline: number)
	{
		this.boardMap = boardMap
		this.board = board
		this.timeline = timeline

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

	clone()
	{
		const board = ChessBoard.empty(this.boardMap, this.player, this.timeline)

		for (let y = 0; y < 8; y++)
		{
			for (let x = 0; x < 8; x++)
			{
				board.board[y][x] = this.board[y][x]
			}
		}

		return board
	}

	move(xFrom: number, yFrom: number, xTo: number, yTo: number)
	{
		const newBoard = this.clone()

		newBoard.board[yTo][xTo] = newBoard.board[yFrom][xFrom]
		newBoard.board[yFrom][xFrom] = null

		return newBoard
	}

	makeMove(xFrom: number, yFrom: number, xTo: number, yTo: number)
	{
		const newBoard = this.move(xFrom, yFrom, xTo, yTo)

		newBoard.player = this.player == Colour.White ? Colour.Black : Colour.White

		this.next.push(newBoard)
	}

	render(el: HTMLElement)
	{
		this.boardEl = document.createElement('table')
		this.boardEl.classList.add('board')

		const flipped = this.player == Colour.White

		for (let y = 7; y >= 0; y--)
		{
			const row = document.createElement('tr')

			for (let x = 0; x < 8; x++)
			{
				const cell = document.createElement('td')

				if (this.squareColour(x, y) == Colour.Black)
				{
					cell.innerHTML += /* html */ `
					<div class="square">
						<img src="/res/svg/board/dark-square.svg">
					</div>
					`
				}
				else
				{
					cell.innerHTML += /* html */ `
					<div class="square">
						<img src="/res/svg/board/light-square.svg">
					</div>
					`
				}

				if (this.pieceAt(x, y) != null)
				{
					// Todo: check if the piece is selectable.

					cell.innerHTML += /* html */ `
					<div class="selectable piece">
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

		el.innerHTML = ''
		el.appendChild(this.boardEl)
	}

	pointedSquare(e: MouseEvent)
	{
		const boardRect = this.boardEl.getBoundingClientRect()
		const { clientX, clientY } = e

		const x = Math.floor((clientX - boardRect.x) / boardRect.width * 8)
		const y = Math.floor((clientY - boardRect.y) / boardRect.height * 8)

		return this.translatePointerPositionToSquare(x, y)
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

		const x = (clientX - rect.x) / rect.width * 100 - rect.width / 2
		const y = (clientY - rect.y) / rect.height * 100 - rect.height / 2

		img.style.transform = `translate(${ x }%, ${ y }%)`
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

		img.style.transform = ''
		this.draggingPiece = null

		this.makeMove(xFrom, yFrom, xTo, yTo)
	}

	static empty(boardMap: ChessBoardMap, player: Colour, timeline: number)
	{
		const board = new ChessBoard(boardMap, [], player, timeline)

		for (let y = 0; y < 8; y++)
		{
			board.board.push(new Array(8).fill(null))
		}

		return board
	}

	static generateDefault(boardMap: ChessBoardMap, player: Colour, timeline: number)
	{
		const board = ChessBoard.empty(boardMap, player, timeline)

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

let map: ChessBoardMap

addEventListener('DOMContentLoaded', () => {
	map = new ChessBoardMap(Colour.White)
	map.render(document.querySelector('.chess-board-map'))
})