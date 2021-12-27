/**
 * Class representing a 2 dimensional square.
 * Holds the x and y coordinates of the square.
 */
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

	equals(other: Square)
	{
		return this.x == other.x && this.y == other.y
	}
}

enum Dimension
{
	X, // Horizontal through space
	Y, // Vertical through space
	T, // Horizontal through time
	U  // Vertical through time
}

const dimensions = [ Dimension.X, Dimension.Y, Dimension.T, Dimension.U ]

const forwardDimensions = [ Dimension.Y, Dimension.U ]
const sidewaysDimensions = [ Dimension.X, Dimension.T ]

const dimensions2Combinations = [
	[ Dimension.X, Dimension.Y ],
	[ Dimension.X, Dimension.T ],
	[ Dimension.X, Dimension.U ],
	[ Dimension.Y, Dimension.T ],
	[ Dimension.Y, Dimension.U ],
	[ Dimension.T, Dimension.U ]
] as [ Dimension, Dimension ][]

interface Movement
{
	dimension: Dimension
	magnitude: number
}

/**
 * Class representing a 5 dimensional square.
 * Holds the x and y values of the square,
 * as well as information of the board it is on.
 */
class Square5D
{
	x: number
	y: number
	t: number
	u: number
	chessBoardMap: ChessBoardMap

	constructor(x: number, y: number, t: number, u: number,
		chessBoardMap: ChessBoardMap)
	{
		this.x = x
		this.y = y
		this.t = t
		this.u = u
		this.chessBoardMap = chessBoardMap
	}

	static fromSquare2D(square: Square, board: ChessBoard)
	{
		return new Square5D(square.x, square.y, board.boardMapPos[0],
			board.boardMapPos[1], board.boardMap)
	}

	clone()
	{
		return new Square5D(this.x, this.y, this.t, this.u,
			this.chessBoardMap)
	}

	getBoard()
	{
		return this.chessBoardMap.get(this.t, this.u)
	}

	getPiece()
	{
		return this.getBoard().pieceAt(this.x, this.y)
	}

	getSquareEl()
	{
		return this.chessBoardMap.getSquare(this)
	}

	equals(other: Square5D)
	{
		return this.x == other.x && this.y == other.y
			&& this.t == other.t && this.u == other.u
	}

	exists()
	{
		return this.getBoard() != null && this.x >= 0 && this.x < 8
			&& this.y >= 0 && this.y < 8
	}

	relativeSquare(arr: Movement[])
	{
		const newSquare = this.clone()

		for (const movement of arr)
		{
			switch (movement.dimension)
			{
				case Dimension.X:
				{
					newSquare.x += movement.magnitude
					break
				}

				case Dimension.Y:
				{
					newSquare.y += movement.magnitude
					break
				}

				case Dimension.T:
				{
					newSquare.t += movement.magnitude * 2
					break
				}

				case Dimension.U:
				{
					newSquare.u += movement.magnitude
					break
				}
			}
		}

		return newSquare
	}
}