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
					return '&#9812;'
				}

				case ChessPieceType.Queen:
				{
					return '&#9813;'
				}

				case ChessPieceType.Rook:
				{
					return '&#9814;'
				}

				case ChessPieceType.Bishop:
				{
					return '&#9815;'
				}

				case ChessPieceType.Knight:
				{
					return '&#9816;'
				}

				case ChessPieceType.Pawn:
				{
					return '&#9817;'
				}
			}
		}

		switch (this.type)
		{
			case ChessPieceType.King:
			{
				return '&#9818;'
			}

			case ChessPieceType.Queen:
			{
				return '&#9819;'
			}

			case ChessPieceType.Rook:
			{
				return '&#9820;'
			}

			case ChessPieceType.Bishop:
			{
				return '&#9821;'
			}

			case ChessPieceType.Knight:
			{
				return '&#9822;'
			}

			case ChessPieceType.Pawn:
			{
				return '&#9823;'
			}
		}
	}
}

/**
 * 5D chess board. Holds the pieces, a reference to the previous board,
 * and references to the next boards.
 */
class ChessBoard
{
	board: ChessPiece[][]
	prev: ChessBoard
	next: ChessBoard[]

	constructor(board: ChessPiece[][], prev: ChessBoard)
	{
		this.board = board
		this.prev = prev
		this.next = []

		// Link this board to the previous board.

		if (prev != null)
		{
			prev.next.push(this)
		}
	}

	decodeCoord(coord: string)
	{
		const x = coord.charCodeAt(0) - 'a'.charCodeAt(0)
		const y = coord.charCodeAt(1) - '1'.charCodeAt(0)

		return [ x, y ]
	}

	set(coord: string, pieceType: ChessPieceType, colour: Colour)
	{
		const [ x, y ] = this.decodeCoord(coord)

		this.board[y][x] = new ChessPiece(pieceType, colour)
	}

	clone()
	{
		const board = ChessBoard.empty()

		for (let y = 0; y < 8; y++)
		{
			for (let x = 0; x < 8; x++)
			{
				board.board[y][x] = this.board[y][x]
			}
		}

		return board
	}

	move(from: string, to: string)
	{
		const newBoard = this.clone()
		const [ x1, y1 ] = this.decodeCoord(from)
		const [ x2, y2 ] = this.decodeCoord(to)

		newBoard.board[y2][x2] = newBoard.board[y1][x1]
		newBoard.board[y1][x1] = null

		return newBoard
	}

	render(el: HTMLElement)
	{
		const table = document.createElement('table')

		for (let y = 7; y >= 0; y--)
		{
			const row = document.createElement('tr')

			for (let x = 0; x < 8; x++)
			{
				const cell = document.createElement('td')

				if (this.board[y][x] != null)
				{
					cell.innerHTML = this.board[y][x].svg()
				}

				row.appendChild(cell)
			}

			table.appendChild(row)
		}

		el.innerHTML = ''
		el.appendChild(table)
	}

	static empty()
	{
		const board = new ChessBoard([], null)

		for (let y = 0; y < 8; y++)
		{
			board.board.push(new Array(8).fill(null))
		}

		return board
	}

	static generateDefault()
	{
		const board = ChessBoard.empty()

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