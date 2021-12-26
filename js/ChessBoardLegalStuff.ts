class Square
{
	x: number
	y: number

	constructor(x: number, y: number)
	{
		this.x = x
		this.y = y
	}

	clone()
	{
		return new Square(this.x, this.y)
	}
}

/**
 * Class that holds the legal stuff for a chess board.
 * Holds everything that is needed to check if a move is legal.
 */
class ChessBoardLegalStuff
{
	whiteKingMoved: boolean
	whiteLeftRookMoved: boolean
	whiteRightRookMoved: boolean

	blackKingMoved: boolean
	blackLeftRookMoved: boolean
	blackRightRookMoved: boolean

	whiteEnPassant: boolean[]
	blackEnPassant: boolean[]

	whiteKing: Square
	blackKing: Square

	board: ChessBoard

	constructor(board: ChessBoard)
	{
		this.board = board

		this.whiteKingMoved = false
		this.whiteLeftRookMoved = false
		this.whiteRightRookMoved = false

		this.blackKingMoved = false
		this.blackLeftRookMoved = false
		this.blackRightRookMoved = false

		this.whiteEnPassant = Array(8).fill(false)
		this.blackEnPassant = Array(8).fill(false)

		this.whiteKing = null
		this.blackKing = null
	}

	clone(board: ChessBoard)
	{
		const newLegalStuff = new ChessBoardLegalStuff(board)

		newLegalStuff.whiteKingMoved = this.whiteKingMoved
		newLegalStuff.whiteLeftRookMoved = this.whiteLeftRookMoved
		newLegalStuff.whiteRightRookMoved = this.whiteRightRookMoved

		newLegalStuff.blackKingMoved = this.blackKingMoved
		newLegalStuff.blackLeftRookMoved = this.blackLeftRookMoved
		newLegalStuff.blackRightRookMoved = this.blackRightRookMoved

		newLegalStuff.whiteEnPassant = this.whiteEnPassant.slice()
		newLegalStuff.blackEnPassant = this.blackEnPassant.slice()

		newLegalStuff.whiteKing = this.whiteKing
		newLegalStuff.blackKing = this.blackKing

		return newLegalStuff
	}

	computeScore()
	{
		let whiteScore = 0
		let blackScore = 0

		for (let y = 0; y < 8; y++)
		{
			for (let x = 0; x < 8; x++)
			{
				const piece = this.board.pieceAt(x, y)

				if (piece != null)
				{
					if (piece.colour == Colour.White)
					{
						whiteScore += piece.value()
					}
					else
					{
						blackScore += piece.value()
					}
				}
			}
		}

		return [ whiteScore, blackScore ]
	}

	whiteInCheck()
	{
		for (let y = 0; y < 8; y++)
		{
			for (let x = 0; x < 8; x++)
			{
				const piece = this.board.pieceAt(x, y)

				if (piece != null && piece.colour == Colour.Black)
				{
					const moves = this.possibleMoves(x, y, false)

					for (const move of moves)
					{
						const piece = this.board.pieceAt(move.x, move.y)

						if (piece != null && piece.is(
							Colour.White, ChessPieceType.King))
						{
							console.log(`white is in check because (${ piece.type }) ${ x } ${ y } can move to ${ move.x } ${ move.y }`)
							this.whiteKing = new Square(move.x, move.y)
							return true
						}
					}
				}
			}
		}

		return false
	}

	blackInCheck()
	{
		for (let y = 0; y < 8; y++)
		{
			for (let x = 0; x < 8; x++)
			{
				const piece = this.board.pieceAt(x, y)

				if (piece != null && piece.colour == Colour.White)
				{
					const moves = this.possibleMoves(x, y, false)

					for (const move of moves)
					{
						const piece = this.board.pieceAt(move.x, move.y)

						if (piece != null && piece.is(
							Colour.Black, ChessPieceType.King))
						{
							console.log(`black is in check because (${ piece.type }) ${ x } ${ y } can move to ${ move.x } ${ move.y }`)
							this.blackKing = new Square(move.x, move.y)
							return true
						}
					}
				}
			}
		}

		return false
	}

	whiteCanMove()
	{
		for (let y = 0; y < 8; y++)
		{
			for (let x = 0; x < 8; x++)
			{
				const piece = this.board.pieceAt(x, y)

				if (piece != null && piece.colour == Colour.White)
				{
					const moves = this.possibleMoves(x, y, false)

					if (moves.length > 0)
					{
						return true
					}
				}
			}
		}

		return false
	}

	blackCanMove()
	{
		for (let y = 0; y < 8; y++)
		{
			for (let x = 0; x < 8; x++)
			{
				const piece = this.board.pieceAt(x, y)

				if (piece != null && piece.colour == Colour.Black)
				{
					const moves = this.possibleMoves(x, y, false)

					if (moves.length > 0)
					{
						return true
					}
				}
			}
		}

		return false
	}

	ended()
	{
		if (this.board.turn == Colour.White && !this.whiteCanMove())
		{
			return true
		}

		if (this.board.turn == Colour.Black && !this.blackCanMove())
		{
			return true
		}

		return false
	}

	possibleMoves(x: number, y: number, checkCheck: boolean)
	{
		const moves: Square[] = []

		if (x >= 8 || y >= 8 || x < 0 || y < 0)
		{
			return moves
		}

		const piece = this.board.pieceAt(x, y)

		if (piece == null)
		{
			return moves
		}

		if (piece.is(Colour.White, ChessPieceType.Pawn))
		{
			if (this.board.pieceAt(x, y + 1) == null)
			{
				if (!checkCheck || this.isLegal(x, y, x, y + 1))
				{
					moves.push(new Square(x, y + 1))
				}

				if (y == 1 && this.board.pieceAt(x, y + 2) == null)
				{
					if (!checkCheck || this.isLegal(x, y, x, y + 2))
					{
						moves.push(new Square(x, y + 2))
					}
				}
			}

			const leftCapture = this.board.pieceAt(x - 1, y + 1)

			if (leftCapture != null && leftCapture.colour == Colour.Black)
			{
				if (!checkCheck || this.isLegal(x, y, x - 1, y + 1))
				{
					moves.push(new Square(x - 1, y + 1))
				}
			}

			const rightCapture = this.board.pieceAt(x + 1, y + 1)

			if (rightCapture != null && rightCapture.colour == Colour.Black)
			{
				if (!checkCheck || this.isLegal(x, y, x + 1, y + 1))
				{
					moves.push(new Square(x + 1, y + 1))
				}
			}

			const leftEnPassant = this.board.pieceAt(x - 1, y)

			if (leftEnPassant != null
				&& leftEnPassant.is(Colour.Black, ChessPieceType.Pawn)
				&& this.blackEnPassant[x - 1])
			{
				if (!checkCheck || this.isLegal(x, y, x - 1, y + 1))
				{
					moves.push(new Square(x - 1, y + 1))
				}
			}

			const rightEnPassant = this.board.pieceAt(x + 1, y)

			if (rightEnPassant != null
				&& rightEnPassant.is(Colour.Black, ChessPieceType.Pawn)
				&& this.blackEnPassant[x + 1])
			{
				if (!checkCheck || this.isLegal(x, y, x + 1, y + 1))
				{
					moves.push(new Square(x + 1, y + 1))
				}
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.Pawn))
		{
			if (this.board.pieceAt(x, y - 1) == null)
			{
				if (!checkCheck || this.isLegal(x, y, x, y - 1))
				{
					moves.push(new Square(x, y - 1))
				}

				if (y == 6 && this.board.pieceAt(x, y - 2) == null)
				{
					if (!checkCheck || this.isLegal(x, y, x, y - 2))
					{
						moves.push(new Square(x, y - 2))
					}
				}
			}

			const leftCapture = this.board.pieceAt(x - 1, y - 1)

			if (leftCapture != null && leftCapture.colour == Colour.White)
			{
				if (!checkCheck || this.isLegal(x, y, x - 1, y - 1))
				{
					moves.push(new Square(x - 1, y - 1))
				}
			}

			const rightCapture = this.board.pieceAt(x + 1, y - 1)

			if (rightCapture != null && rightCapture.colour == Colour.White)
			{
				if (!checkCheck || this.isLegal(x, y, x + 1, y - 1))
				{
					moves.push(new Square(x + 1, y - 1))
				}
			}

			const leftEnPassant = this.board.pieceAt(x - 1, y)

			if (leftEnPassant != null
				&& leftEnPassant.is(Colour.White, ChessPieceType.Pawn)
				&& this.whiteEnPassant[x - 1])
			{
				if (!checkCheck || this.isLegal(x, y, x - 1, y - 1))
				{
					moves.push(new Square(x - 1, y - 1))
				}
			}

			const rightEnPassant = this.board.pieceAt(x + 1, y)

			if (rightEnPassant != null
				&& rightEnPassant.is(Colour.White, ChessPieceType.Pawn)
				&& this.whiteEnPassant[x + 1])
			{
				if (!checkCheck || this.isLegal(x, y, x + 1, y - 1))
				{
					moves.push(new Square(x + 1, y - 1))
				}
			}
		}

		if (piece.is(Colour.White, ChessPieceType.Bishop))
		{
			let diag = new Square(x + 1, y + 1)

			while (diag.x < 8 && diag.y < 8)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				diag.x++
				diag.y++
			}

			diag = new Square(x + 1, y - 1)

			while (diag.x < 8 && diag.y >= 0)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				diag.x++
				diag.y--
			}

			diag = new Square(x - 1, y + 1)

			while (diag.x >= 0 && diag.y < 8)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				diag.x--
				diag.y++
			}

			diag = new Square(x - 1, y - 1)

			while (diag.x >= 0 && diag.y >= 0)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				diag.x--
				diag.y--
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.Bishop))
		{
			let diag = new Square(x + 1, y + 1)

			while (diag.x < 8 && diag.y < 8)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				diag.x++
				diag.y++
			}

			diag = new Square(x + 1, y - 1)

			while (diag.x < 8 && diag.y >= 0)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				diag.x++
				diag.y--
			}

			diag = new Square(x - 1, y + 1)

			while (diag.x >= 0 && diag.y < 8)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				diag.x--
				diag.y++
			}

			diag = new Square(x - 1, y - 1)

			while (diag.x >= 0 && diag.y >= 0)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				diag.x--
				diag.y--
			}
		}

		if (piece.is(Colour.White, ChessPieceType.Knight))
		{
			if (x - 1 >= 0 && y - 2 >= 0)
			{
				const piece = this.board.pieceAt(x - 1, y - 2)

				if (piece == null || piece.colour != Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x - 1, y - 2))
					{
						moves.push(new Square(x - 1, y - 2))
					}
				}
			}

			if (x - 2 >= 0 && y - 1 >= 0)
			{
				const piece = this.board.pieceAt(x - 2, y - 1)

				if (piece == null || piece.colour != Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x - 2, y - 1))
					{
						moves.push(new Square(x - 2, y - 1))
					}
				}
			}

			if (x + 1 < 8 && y - 2 >= 0)
			{
				const piece = this.board.pieceAt(x + 1, y - 2)

				if (piece == null || piece.colour != Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x + 1, y - 2))
					{
						moves.push(new Square(x + 1, y - 2))
					}
				}
			}

			if (x + 2 < 8 && y - 1 >= 0)
			{
				const piece = this.board.pieceAt(x + 2, y - 1)

				if (piece == null || piece.colour != Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x + 2, y - 1))
					{
						moves.push(new Square(x + 2, y - 1))
					}
				}
			}

			if (x - 1 >= 0 && y + 2 < 8)
			{
				const piece = this.board.pieceAt(x - 1, y + 2)

				if (piece == null || piece.colour != Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x - 1, y + 2))
					{
						moves.push(new Square(x - 1, y + 2))
					}
				}
			}

			if (x - 2 >= 0 && y + 1 < 8)
			{
				const piece = this.board.pieceAt(x - 2, y + 1)

				if (piece == null || piece.colour != Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x - 2, y + 1))
					{
						moves.push(new Square(x - 2, y + 1))
					}
				}
			}

			if (x + 1 < 8 && y + 2 < 8)
			{
				const piece = this.board.pieceAt(x + 1, y + 2)

				if (piece == null || piece.colour != Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x + 1, y + 2))
					{
						moves.push(new Square(x + 1, y + 2))
					}
				}
			}

			if (x + 2 < 8 && y + 1 < 8)
			{
				const piece = this.board.pieceAt(x + 2, y + 1)

				if (piece == null || piece.colour != Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x + 2, y + 1))
					{
						moves.push(new Square(x + 2, y + 1))
					}
				}
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.Knight))
		{
			if (x - 1 >= 0 && y - 2 >= 0)
			{
				const piece = this.board.pieceAt(x - 1, y - 2)

				if (piece == null || piece.colour != Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x - 1, y - 2))
					{
						moves.push(new Square(x - 1, y - 2))
					}
				}
			}

			if (x - 2 >= 0 && y - 1 >= 0)
			{
				const piece = this.board.pieceAt(x - 2, y - 1)

				if (piece == null || piece.colour != Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x - 2, y - 1))
					{
						moves.push(new Square(x - 2, y - 1))
					}
				}
			}

			if (x + 1 < 8 && y - 2 >= 0)
			{
				const piece = this.board.pieceAt(x + 1, y - 2)

				if (piece == null || piece.colour != Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x + 1, y - 2))
					{
						moves.push(new Square(x + 1, y - 2))
					}
				}
			}

			if (x + 2 < 8 && y - 1 >= 0)
			{
				const piece = this.board.pieceAt(x + 2, y - 1)

				if (piece == null || piece.colour != Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x + 2, y - 1))
					{
						moves.push(new Square(x + 2, y - 1))
					}
				}
			}

			if (x - 1 >= 0 && y + 2 < 8)
			{
				const piece = this.board.pieceAt(x - 1, y + 2)

				if (piece == null || piece.colour != Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x - 1, y + 2))
					{
						moves.push(new Square(x - 1, y + 2))
					}
				}
			}

			if (x - 2 >= 0 && y + 1 < 8)
			{
				const piece = this.board.pieceAt(x - 2, y + 1)

				if (piece == null || piece.colour != Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x - 2, y + 1))
					{
						moves.push(new Square(x - 2, y + 1))
					}
				}
			}

			if (x + 1 < 8 && y + 2 < 8)
			{
				const piece = this.board.pieceAt(x + 1, y + 2)

				if (piece == null || piece.colour != Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x + 1, y + 2))
					{
						moves.push(new Square(x + 1, y + 2))
					}
				}
			}

			if (x + 2 < 8 && y + 1 < 8)
			{
				const piece = this.board.pieceAt(x + 2, y + 1)

				if (piece == null || piece.colour != Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x + 2, y + 1))
					{
						moves.push(new Square(x + 2, y + 1))
					}
				}
			}
		}

		if (piece.is(Colour.White, ChessPieceType.Rook))
		{
			let line = new Square(x + 1, y)

			while (line.x < 8)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				line.x++
			}

			line = new Square(x - 1, y)

			while (line.x >= 0)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				line.x--
			}

			line = new Square(x, y + 1)

			while (line.y < 8)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				line.y++
			}

			line = new Square(x, y - 1)

			while (line.y >= 0)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				line.y--
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.Rook))
		{
			let line = new Square(x + 1, y)

			while (line.x < 8)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				line.x++
			}

			line = new Square(x - 1, y)

			while (line.x >= 0)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				line.x--
			}

			line = new Square(x, y + 1)

			while (line.y < 8)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				line.y++
			}

			line = new Square(x, y - 1)

			while (line.y >= 0)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				line.y--
			}
		}

		if (piece.is(Colour.White, ChessPieceType.Queen))
		{
			let diag = new Square(x + 1, y + 1)

			while (diag.x < 8 && diag.y < 8)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				diag.x++
				diag.y++
			}

			diag = new Square(x - 1, y - 1)

			while (diag.x >= 0 && diag.y >= 0)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				diag.x--
				diag.y--
			}

			diag = new Square(x + 1, y - 1)

			while (diag.x < 8 && diag.y >= 0)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				diag.x++
				diag.y--
			}

			diag = new Square(x - 1, y + 1)

			while (diag.x >= 0 && diag.y < 8)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				diag.x--
				diag.y++
			}

			let line = new Square(x + 1, y)

			while (line.x < 8)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				line.x++
			}

			line = new Square(x - 1, y)

			while (line.x >= 0)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				line.x--
			}

			line = new Square(x, y + 1)

			while (line.y < 8)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				line.y++
			}

			line = new Square(x, y - 1)

			while (line.y >= 0)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				line.y--
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.Queen))
		{
			let diag = new Square(x + 1, y + 1)

			while (diag.x < 8 && diag.y < 8)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				diag.x++
				diag.y++
			}

			diag = new Square(x - 1, y - 1)

			while (diag.x >= 0 && diag.y >= 0)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				diag.x--
				diag.y--
			}

			diag = new Square(x + 1, y - 1)

			while (diag.x < 8 && diag.y >= 0)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				diag.x++
				diag.y--
			}

			diag = new Square(x - 1, y + 1)

			while (diag.x >= 0 && diag.y < 8)
			{
				const piece = this.board.pieceAt(diag.x, diag.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, diag.x, diag.y))
				{
					moves.push(diag.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				diag.x--
				diag.y++
			}

			let line = new Square(x + 1, y)

			while (line.x < 8)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				line.x++
			}

			line = new Square(x - 1, y)

			while (line.x >= 0)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				line.x--
			}

			line = new Square(x, y + 1)

			while (line.y < 8)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				line.y++
			}

			line = new Square(x, y - 1)

			while (line.y >= 0)
			{
				const piece = this.board.pieceAt(line.x, line.y)

				if (piece != null && piece.colour == Colour.Black)
				{
					break
				}

				if (!checkCheck || this.isLegal(x, y, line.x, line.y))
				{
					moves.push(line.clone())
				}

				if (piece != null && piece.colour == Colour.White)
				{
					break
				}

				line.y--
			}
		}

		if (piece.is(Colour.White, ChessPieceType.King))
		{
			if (x + 1 < 8 && y + 1 < 8)
			{
				const piece = this.board.pieceAt(x + 1, y + 1)

				if (piece == null || piece.colour == Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x + 1, y + 1))
					{
						moves.push(new Square(x + 1, y + 1))
					}
				}
			}

			if (x + 1 < 8 && y - 1 >= 0)
			{
				const piece = this.board.pieceAt(x + 1, y - 1)

				if (piece == null || piece.colour == Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x + 1, y - 1))
					{
						moves.push(new Square(x + 1, y - 1))
					}
				}
			}

			if (x - 1 >= 0 && y + 1 < 8)
			{
				const piece = this.board.pieceAt(x - 1, y + 1)

				if (piece == null || piece.colour == Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x - 1, y + 1))
					{
						moves.push(new Square(x - 1, y + 1))
					}
				}
			}

			if (x - 1 >= 0 && y - 1 >= 0)
			{
				const piece = this.board.pieceAt(x - 1, y - 1)

				if (piece == null || piece.colour == Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x - 1, y - 1))
					{
						moves.push(new Square(x - 1, y - 1))
					}
				}
			}

			if (x + 1 < 8)
			{
				const piece = this.board.pieceAt(x + 1, y)

				if (piece == null || piece.colour == Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x + 1, y))
					{
						moves.push(new Square(x + 1, y))
					}
				}
			}

			if (x - 1 >= 0)
			{
				const piece = this.board.pieceAt(x - 1, y)

				if (piece == null || piece.colour == Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x - 1, y))
					{
						moves.push(new Square(x - 1, y))
					}
				}
			}

			if (y + 1 < 8)
			{
				const piece = this.board.pieceAt(x, y + 1)

				if (piece == null || piece.colour == Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x, y + 1))
					{
						moves.push(new Square(x, y + 1))
					}
				}
			}

			if (y - 1 >= 0)
			{
				const piece = this.board.pieceAt(x, y - 1)

				if (piece == null || piece.colour == Colour.Black)
				{
					if (!checkCheck || this.isLegal(x, y, x, y - 1))
					{
						moves.push(new Square(x, y - 1))
					}
				}
			}

			if (!this.whiteKingMoved && !this.whiteRightRookMoved
				&& this.board.pieceAt(x + 1, y) == null
				&& this.board.pieceAt(x + 2, y) == null
				&& checkCheck
				&& !this.whiteInCheck()
				&& this.isLegal(x, y, x + 1, y)
				&& this.isLegal(x, y, x + 2, y))
			{
				moves.push(new Square(x + 2, y))
			}

			if (!this.whiteKingMoved && !this.whiteLeftRookMoved
				&& this.board.pieceAt(x - 1, y) == null
				&& this.board.pieceAt(x - 2, y) == null
				&& this.board.pieceAt(x - 3, y) == null
				&& checkCheck
				&& !this.whiteInCheck()
				&& this.isLegal(x, y, x - 1, y)
				&& this.isLegal(x, y, x - 2, y)
				&& this.isLegal(x, y, x - 3, y))
			{
				moves.push(new Square(x - 2, y))
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.King))
		{
			if (x + 1 < 8 && y + 1 < 8)
			{
				const piece = this.board.pieceAt(x + 1, y + 1)

				if (piece == null || piece.colour == Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x + 1, y + 1))
					{
						moves.push(new Square(x + 1, y + 1))
					}
				}
			}

			if (x + 1 < 8 && y - 1 >= 0)
			{
				const piece = this.board.pieceAt(x + 1, y - 1)

				if (piece == null || piece.colour == Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x + 1, y - 1))
					{
						moves.push(new Square(x + 1, y - 1))
					}
				}
			}

			if (x - 1 >= 0 && y + 1 < 8)
			{
				const piece = this.board.pieceAt(x - 1, y + 1)

				if (piece == null || piece.colour == Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x - 1, y + 1))
					{
						moves.push(new Square(x - 1, y + 1))
					}
				}
			}

			if (x - 1 >= 0 && y - 1 >= 0)
			{
				const piece = this.board.pieceAt(x - 1, y - 1)

				if (piece == null || piece.colour == Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x - 1, y - 1))
					{
						moves.push(new Square(x - 1, y - 1))
					}
				}
			}

			if (x + 1 < 8)
			{
				const piece = this.board.pieceAt(x + 1, y)

				if (piece == null || piece.colour == Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x + 1, y))
					{
						moves.push(new Square(x + 1, y))
					}
				}
			}

			if (x - 1 >= 0)
			{
				const piece = this.board.pieceAt(x - 1, y)

				if (piece == null || piece.colour == Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x - 1, y))
					{
						moves.push(new Square(x - 1, y))
					}
				}
			}

			if (y + 1 < 8)
			{
				const piece = this.board.pieceAt(x, y + 1)

				if (piece == null || piece.colour == Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x, y + 1))
					{
						moves.push(new Square(x, y + 1))
					}
				}
			}

			if (y - 1 >= 0)
			{
				const piece = this.board.pieceAt(x, y - 1)

				if (piece == null || piece.colour == Colour.White)
				{
					if (!checkCheck || this.isLegal(x, y, x, y - 1))
					{
						moves.push(new Square(x, y - 1))
					}
				}
			}

			if (!this.blackKingMoved && !this.blackRightRookMoved
				&& this.board.pieceAt(x + 1, y) == null
				&& this.board.pieceAt(x + 2, y) == null
				&& checkCheck
				&& !this.blackInCheck()
				&& this.isLegal(x, y, x + 1, y)
				&& this.isLegal(x, y, x + 2, y))
			{
				moves.push(new Square(x + 2, y))
			}

			if (!this.blackKingMoved && !this.blackLeftRookMoved
				&& this.board.pieceAt(x - 1, y) == null
				&& this.board.pieceAt(x - 2, y) == null
				&& checkCheck
				&& !this.blackInCheck()
				&& this.isLegal(x, y, x - 1, y)
				&& this.isLegal(x, y, x - 2, y))
			{
				moves.push(new Square(x - 2, y))
			}
		}

		return moves
	}

	pretend(from: Square, to: Square)
	{
		const oldPiece = this.board.pieceAt(to.x, to.y)
		const movedPiece = this.board.pieceAt(from.x, from.y)

		this.board.setAt(from.x, from.y, null)
		this.board.setAt(to.x, to.y, movedPiece)

		return oldPiece
	}

	unpretend(from: Square, to: Square, oldPiece: ChessPiece)
	{
		this.board.setAt(from.x, from.y, this.board.pieceAt(to.x, to.y))
		this.board.setAt(to.x, to.y, oldPiece)
	}

	isLegal(xFrom: number, yFrom: number, xTo: number, yTo: number)
	{
		const from = new Square(xFrom, yFrom)
		const to = new Square(xTo, yTo)

		const oldPiece = this.pretend(from, to)

		let check = false

		if (this.board.turn == Colour.White)
		{
			check = this.whiteInCheck()
		}
		else
		{
			check = this.blackInCheck()
		}

		this.unpretend(from, to, oldPiece)

		return !check
	}
}