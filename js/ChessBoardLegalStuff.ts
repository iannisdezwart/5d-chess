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
							this.whiteKing = this.square(move.x, move.y)
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
							this.blackKing = this.square(move.x, move.y)
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

	square(x: number, y: number): Square5D
	{
		const square2D = new Square(x, y)
		return Square5D.fromSquare2D(square2D, this.board)
	}

	moveLineHelper(x: number, y: number, movement: Movement,
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		const otherColour = colour == Colour.White
			? Colour.Black : Colour.White

		let square = this.square(x, y).relativeSquare([ movement ])

		while (square.exists())
		{
			const piece = square.getPiece()

			if (piece != null && piece.colour == colour)
			{
				break
			}

			if (!checkCheck || this.isLegal(x, y, square))
			{
				moves.push(square.clone())
			}

			if (piece != null && piece.colour == otherColour)
			{
				break
			}

			square = square.relativeSquare([ movement ])
		}
	}

	moveLine(x: number, y: number, dimension: Dimension,
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		// Forward movement through this dimension.

		this.moveLineHelper(x, y,
			{ dimension, magnitude: 1 },
			moves, checkCheck, colour)

		// Backward movement through this dimension.

		this.moveLineHelper(x, y,
			{ dimension, magnitude: -1 },
			moves, checkCheck, colour)
	}

	moveLine1SquareHelper(x: number, y: number, movement: Movement,
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		const square = this.square(x, y).relativeSquare([ movement ])

		if (!square.exists())
		{
			return
		}

		const piece = square.getPiece()

		if (piece != null && piece.colour == colour)
		{
			return false
		}

		if (!checkCheck || this.isLegal(x, y, square))
		{
			moves.push(square.clone())
		}

		return true
	}

	moveLine1Square(x: number, y: number, dimension: Dimension,
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		// Forward movement through this dimension.

		this.moveLine1SquareHelper(x, y,
			{ dimension, magnitude: 1 },
			moves, checkCheck, colour)

		// Backward movement through this dimension.

		this.moveLine1SquareHelper(x, y,
			{ dimension, magnitude: -1 },
			moves, checkCheck, colour)
	}

	moveForward1Square(x: number, y: number, dimension: Dimension,
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		const magnitude = colour == Colour.White ? 1 : -1
		const movement = { dimension, magnitude }

		const square = this.square(x, y).relativeSquare([ movement ])

		if (!square.exists() || square.getPiece() != null)
		{
			return
		}

		return this.moveLine1SquareHelper(x, y, movement,
			moves, checkCheck, colour)
	}

	moveForward1Or2Squares(x: number, y: number, dimension: Dimension,
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		if (!this.moveForward1Square(x, y, dimension, moves,
			checkCheck, colour))
		{
			return
		}

		const magnitude = colour == Colour.White ? 2 : -2

		this.moveLine1SquareHelper(x, y,
			{ dimension, magnitude },
			moves, checkCheck, colour)
	}

	moveDiagHelper(x: number, y: number, movements: [ Movement, Movement ],
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		const otherColour = colour == Colour.White
			? Colour.Black : Colour.White

		let square = this.square(x, y).relativeSquare(movements)

		while (square.exists())
		{
			const piece = square.getPiece()

			if (piece != null && piece.colour == colour)
			{
				break
			}

			if (!checkCheck || this.isLegal(x, y, square))
			{
				moves.push(square.clone())
			}

			if (piece != null && piece.colour == otherColour)
			{
				break
			}

			square = square.relativeSquare(movements)
		}
	}

	moveDiag(x: number, y: number, dimension: [ Dimension, Dimension ],
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		// Positive positive diagonal.

		this.moveDiagHelper(x, y, [
			{ dimension: dimension[0], magnitude: 1 },
			{ dimension: dimension[1], magnitude: 1 }
		], moves, checkCheck, colour)

		// Positive negative diagonal.

		this.moveDiagHelper(x, y, [
			{ dimension: dimension[0], magnitude: 1 },
			{ dimension: dimension[1], magnitude: -1 }
		], moves, checkCheck, colour)

		// Negative positive diagonal.

		this.moveDiagHelper(x, y, [
			{ dimension: dimension[0], magnitude: -1 },
			{ dimension: dimension[1], magnitude: 1 }
		], moves, checkCheck, colour)

		// Negative negative diagonal.

		this.moveDiagHelper(x, y, [
			{ dimension: dimension[0], magnitude: -1 },
			{ dimension: dimension[1], magnitude: -1 }
		], moves, checkCheck, colour)
	}

	moveDiag1SquareHelper(x: number, y: number, movements: [ Movement, Movement ],
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		const square = this.square(x, y).relativeSquare(movements)

		if (!square.exists())
		{
			return
		}

		const piece = square.getPiece()

		if (piece != null && piece.colour == colour)
		{
			return
		}

		if (!checkCheck || this.isLegal(x, y, square))
		{
			moves.push(square.clone())
		}
	}

	moveDiag1Square(x: number, y: number, dimension: [ Dimension, Dimension ],
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		// Positive positive diagonal.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: 1 },
			{ dimension: dimension[1], magnitude: 1 }
		], moves, checkCheck, colour)

		// Positive negative diagonal.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: 1 },
			{ dimension: dimension[1], magnitude: -1 }
		], moves, checkCheck, colour)

		// Negative positive diagonal.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: -1 },
			{ dimension: dimension[1], magnitude: 1 }
		], moves, checkCheck, colour)

		// Negative negative diagonal.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: -1 },
			{ dimension: dimension[1], magnitude: -1 }
		], moves, checkCheck, colour)
	}

	moveLShape(x: number, y: number, dimension: [ Dimension, Dimension ],
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		// Positive positive L shape 1.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: 1 },
			{ dimension: dimension[1], magnitude: 2 }
		], moves, checkCheck, colour)

		// Positive positive L shape 2.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: 2 },
			{ dimension: dimension[1], magnitude: 1 }
		], moves, checkCheck, colour)

		// Positive negative L shape 1.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: 1 },
			{ dimension: dimension[1], magnitude: -2 }
		], moves, checkCheck, colour)

		// Positive negative L shape 2.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: -2 },
			{ dimension: dimension[1], magnitude: 1 }
		], moves, checkCheck, colour)

		// Negative positive L shape 1.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: -1 },
			{ dimension: dimension[1], magnitude: 2 }
		], moves, checkCheck, colour)

		// Negative positive L shape 2.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: 2 },
			{ dimension: dimension[1], magnitude: -1 }
		], moves, checkCheck, colour)

		// Negative negative L shape 1.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: -1 },
			{ dimension: dimension[1], magnitude: -2 }
		], moves, checkCheck, colour)

		// Negative negative L shape 2.

		this.moveDiag1SquareHelper(x, y, [
			{ dimension: dimension[0], magnitude: -2 },
			{ dimension: dimension[1], magnitude: -1 }
		], moves, checkCheck, colour)
	}

	moveDiagCapture1SquareHelper(x: number, y: number, movements: [ Movement, Movement ],
		moves: Square5D[], checkCheck: boolean, colour: Colour)
	{
		const otherColour = colour == Colour.White
			? Colour.Black : Colour.White

		const square = this.square(x, y).relativeSquare(movements)

		if (!square.exists())
		{
			return
		}

		const capture = square.getPiece()

		if (capture != null && capture.colour == otherColour)
		{
			if (!checkCheck || this.isLegal(x, y, square))
			{
				moves.push(square)
			}
		}
	}

	moveDiagCapture1Square(x: number, y: number, moves: Square5D[],
		checkCheck: boolean, colour: Colour)
	{
		const magnitude = colour == Colour.White ? 1 : -1

		// Capture over the same board.

		this.moveDiagCapture1SquareHelper(x, y, [
			{ dimension: Dimension.X, magnitude: -1 },
			{ dimension: Dimension.Y, magnitude }
		], moves, checkCheck, colour)

		this.moveDiagCapture1SquareHelper(x, y, [
			{ dimension: Dimension.X, magnitude: 1 },
			{ dimension: Dimension.Y, magnitude }
		], moves, checkCheck, colour)

		// Capture over a diagonal board

		this.moveDiagCapture1SquareHelper(x, y, [
			{ dimension: Dimension.T, magnitude: -1 },
			{ dimension: Dimension.U, magnitude }
		], moves, checkCheck, colour)

		this.moveDiagCapture1SquareHelper(x, y, [
			{ dimension: Dimension.T, magnitude: 1 },
			{ dimension: Dimension.U, magnitude }
		], moves, checkCheck, colour)
	}

	possibleMoves(x: number, y: number, checkCheck: boolean)
	{
		const moves: Square5D[] = []

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
			for (const dimension of forwardDimensions)
			{
				if (y == 1)
				{
					this.moveForward1Or2Squares(x, y,
						dimension, moves,
						checkCheck, Colour.White)
				}
				else
				{
					this.moveForward1Square(x, y,
						dimension, moves,
						checkCheck, Colour.White)
				}
			}

			this.moveDiagCapture1Square(x, y, moves, checkCheck, Colour.White)

			// Todo: En passant in multiple dimensions??!!

			const leftEnPassant = this.board.pieceAt(x - 1, y)

			if (leftEnPassant != null
				&& leftEnPassant.is(Colour.Black, ChessPieceType.Pawn)
				&& this.blackEnPassant[x - 1])
			{
				if (!checkCheck || this.isLegal(x, y, this.square(x - 1, y + 1)))
				{
					moves.push(this.square(x - 1, y + 1))
				}
			}

			const rightEnPassant = this.board.pieceAt(x + 1, y)

			if (rightEnPassant != null
				&& rightEnPassant.is(Colour.Black, ChessPieceType.Pawn)
				&& this.blackEnPassant[x + 1])
			{
				if (!checkCheck || this.isLegal(x, y, this.square(x + 1, y + 1)))
				{
					moves.push(this.square(x + 1, y + 1))
				}
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.Pawn))
		{
			for (const dimension of forwardDimensions)
			{
				if (y == 6)
				{
					this.moveForward1Or2Squares(x, y,
						dimension, moves,
						checkCheck, Colour.Black)
				}
				else
				{
					this.moveForward1Square(x, y,
						dimension, moves,
						checkCheck, Colour.Black)
				}
			}

			this.moveDiagCapture1Square(x, y, moves, checkCheck, Colour.Black)

			// Todo: En passant in multiple dimensions??!!

			const leftEnPassant = this.board.pieceAt(x - 1, y)

			if (leftEnPassant != null
				&& leftEnPassant.is(Colour.White, ChessPieceType.Pawn)
				&& this.whiteEnPassant[x - 1])
			{
				if (!checkCheck || this.isLegal(x, y, this.square(x - 1, y - 1)))
				{
					moves.push(this.square(x - 1, y - 1))
				}
			}

			const rightEnPassant = this.board.pieceAt(x + 1, y)

			if (rightEnPassant != null
				&& rightEnPassant.is(Colour.White, ChessPieceType.Pawn)
				&& this.whiteEnPassant[x + 1])
			{
				if (!checkCheck || this.isLegal(x, y, this.square(x + 1, y - 1)))
				{
					moves.push(this.square(x + 1, y - 1))
				}
			}
		}

		if (piece.is(Colour.White, ChessPieceType.Bishop))
		{
			for (const dimensions of dimensions2Combinations)
			{
				this.moveDiag(x, y, dimensions, moves, checkCheck, Colour.White)
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.Bishop))
		{
			for (const dimensions of dimensions2Combinations)
			{
				this.moveDiag(x, y, dimensions, moves, checkCheck, Colour.Black)
			}
		}

		if (piece.is(Colour.White, ChessPieceType.Knight))
		{
			for (const dimensions of dimensions2Combinations)
			{
				this.moveLShape(x, y, dimensions, moves, checkCheck, Colour.White)
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.Knight))
		{
			for (const dimensions of dimensions2Combinations)
			{
				this.moveLShape(x, y, dimensions, moves, checkCheck, Colour.Black)
			}
		}

		if (piece.is(Colour.White, ChessPieceType.Rook))
		{
			for (const dimension of dimensions)
			{
				this.moveLine(x, y, dimension, moves,
					checkCheck, Colour.White)
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.Rook))
		{
			for (const dimension of dimensions)
			{
				this.moveLine(x, y, dimension, moves,
					checkCheck, Colour.Black)
			}
		}

		if (piece.is(Colour.White, ChessPieceType.Queen))
		{
			for (const dimension of dimensions)
			{
				this.moveLine(x, y, dimension, moves,
					checkCheck, Colour.White)
			}

			for (const dimensions of dimensions2Combinations)
			{
				this.moveDiag(x, y, dimensions, moves,
					checkCheck, Colour.White)
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.Queen))
		{
			for (const dimension of dimensions)
			{
				this.moveLine(x, y, dimension, moves,
					checkCheck, Colour.Black)
			}

			for (const dimensions of dimensions2Combinations)
			{
				this.moveDiag(x, y, dimensions, moves,
					checkCheck, Colour.Black)
			}
		}

		if (piece.is(Colour.White, ChessPieceType.King))
		{
			for (const dimension of dimensions)
			{
				this.moveLine1Square(x, y, dimension, moves,
					checkCheck, Colour.White)
			}

			for (const dimensions of dimensions2Combinations)
			{
				this.moveDiag1Square(x, y, dimensions, moves,
					checkCheck, Colour.White)
			}

			// Todo: Castling in multiple dimensions??!!
			// Todo: Make it work when there are multiple kings
			// on the board.

			if (!this.whiteKingMoved && !this.whiteRightRookMoved
				&& this.board.pieceAt(x + 1, y) == null
				&& this.board.pieceAt(x + 2, y) == null
				&& checkCheck
				&& !this.whiteInCheck()
				&& this.isLegal(x, y, this.square(x + 1, y))
				&& this.isLegal(x, y, this.square(x + 2, y)))
			{
				moves.push(this.square(x + 2, y))
			}

			if (!this.whiteKingMoved && !this.whiteLeftRookMoved
				&& this.board.pieceAt(x - 1, y) == null
				&& this.board.pieceAt(x - 2, y) == null
				&& this.board.pieceAt(x - 3, y) == null
				&& checkCheck
				&& !this.whiteInCheck()
				&& this.isLegal(x, y, this.square(x - 1, y))
				&& this.isLegal(x, y, this.square(x - 2, y))
				&& this.isLegal(x, y, this.square(x - 3, y)))
			{
				moves.push(this.square(x - 2, y))
			}
		}

		if (piece.is(Colour.Black, ChessPieceType.King))
		{
			for (const dimension of dimensions)
			{
				this.moveLine1Square(x, y, dimension, moves,
					checkCheck, Colour.Black)
			}

			for (const dimensions of dimensions2Combinations)
			{
				this.moveDiag1Square(x, y, dimensions, moves,
					checkCheck, Colour.Black)
			}

			// Todo: Castling in multiple dimensions??!!
			// Todo: Make it work when there are multiple kings
			// on the board.

			if (!this.blackKingMoved && !this.blackRightRookMoved
				&& this.board.pieceAt(x + 1, y) == null
				&& this.board.pieceAt(x + 2, y) == null
				&& checkCheck
				&& !this.blackInCheck()
				&& this.isLegal(x, y, this.square(x + 1, y))
				&& this.isLegal(x, y, this.square(x + 2, y)))
			{
				moves.push(this.square(x + 2, y))
			}

			if (!this.blackKingMoved && !this.blackLeftRookMoved
				&& this.board.pieceAt(x - 1, y) == null
				&& this.board.pieceAt(x - 2, y) == null
				&& this.board.pieceAt(x - 3, y) == null
				&& checkCheck
				&& !this.blackInCheck()
				&& this.isLegal(x, y, this.square(x - 1, y))
				&& this.isLegal(x, y, this.square(x - 2, y))
				&& this.isLegal(x, y, this.square(x - 3, y)))
			{
				moves.push(this.square(x - 2, y))
			}
		}

		return moves
	}

	pretend(from: Square, to: Square5D)
	{
		const oldPiece = to.getPiece()
		const movedPiece = this.board.pieceAt(from.x, from.y)

		this.board.setAt(from.x, from.y, null)
		to.getBoard().setAt(to.x, to.y, movedPiece)

		return oldPiece
	}

	unpretend(from: Square, to: Square5D, oldPiece: ChessPiece)
	{
		this.board.setAt(from.x, from.y, to.getPiece())
		to.getBoard().setAt(to.x, to.y, oldPiece)
	}

	isLegal(xFrom: number, yFrom: number, to: Square5D)
	{
		const from = this.square(xFrom, yFrom)

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