/**
 * Class representing the map of all chess boards.
 * Holds the entire 5D map of individual chess boards.
 */
class ChessBoardMap
{
	mapEl: HTMLElement
	root: ChessBoard
	map: ChessBoard[][] = []
	minU = 0 // The minimum universe index
	get maxU() { return this.map.length - this.minU - 1 }
	player: Colour

	draggingPiece: HTMLElement
	draggingPieceSquare: Square5D

	constructor(player: Colour, mapEl: HTMLElement)
	{
		this.player = player
		this.root = ChessBoard.generateDefault(this,
			new TimeCoordinate(0, 0), Colour.White)
		this.root.legalStuff = new ChessBoardLegalStuff(this.root)
		this.map = [ [ this.root ] ]
		this.mapEl = mapEl

		mapEl.addEventListener('mousedown', this.mouseDownHandler.bind(this))
		mapEl.addEventListener('touchstart', this.mouseDownHandler.bind(this))

		mapEl.addEventListener('mousemove', this.mouseMoveHandler.bind(this))
		mapEl.addEventListener('touchmove', this.mouseMoveHandler.bind(this))

		mapEl.addEventListener('mouseup', this.mouseUpHandler.bind(this))
		mapEl.addEventListener('toucheend', this.mouseUpHandler.bind(this))

		this.update()
	}

	pointedSquare(e: MouseEvent)
	{
		const { clientX, clientY } = e
		let target = e.target as HTMLElement

		while (true)
		{
			if (target == null)
			{
				return null
			}

			if (target.classList.contains('board'))
			{
				break
			}

			target = target.parentElement
		}

		const boardRect = target.getBoundingClientRect()
		const boardPos = TimeCoordinate.fromString(
			target.getAttribute('data-board-position'))
		const board = this.get(boardPos.t, boardPos.u)

		const xSel = Math.floor((clientX - boardRect.x) / boardRect.width * 8)
		const ySel = Math.floor((clientY - boardRect.y) / boardRect.height * 8)

		const [ x, y ] = board.translatePointerPositionToSquare(xSel, ySel)
		return new Square5D(x, y, boardPos.t, boardPos.u, this)
	}

	getSquare(square: Square5D)
	{
		const board = square.getBoard()
		const { x, y } = square
		const sq = board.translatePointerPositionToSquare(x, y)
		return board.boardEl.children[sq[1]].children[sq[0]]
	}

	mouseDownHandler(e: MouseEvent)
	{
		const target = e.target as HTMLElement

		if (!target.classList.contains('piece')
			|| !target.classList.contains('selectable'))
		{
			return
		}

		this.draggingPiece = target
		this.draggingPieceSquare = this.pointedSquare(e)

		const { x: xFrom, y: yFrom } = this.draggingPieceSquare
		const board = this.draggingPieceSquare.getBoard()
		const legalMoves = board.legalStuff.possibleMoves(xFrom, yFrom, true)

		for (const square of legalMoves)
		{
			const squareEl = this.getSquare(square)
			squareEl.classList.add('legal-move')
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

		const fromSquare = this.draggingPieceSquare
		const fromBoard = fromSquare.getBoard()
		const toSquare = this.pointedSquare(e)
		const toSquareEl = toSquare.getSquareEl()
		const moveIsLegal = toSquareEl.classList.contains('legal-move')

		const img = this.draggingPiece.querySelector<HTMLImageElement>('img')

		img.style.transform = null
		img.style.zIndex = null
		this.draggingPiece = null

		for (const square of [].slice.call(document.querySelectorAll('.legal-move')))
		{
			square.classList.remove('legal-move')
		}

		if (fromSquare.equals(toSquare) || !moveIsLegal)
		{
			return
		}

		fromBoard.move(fromSquare, toSquare)
		this.update()
	}

	get(t: number, u: number)
	{
		const universe = this.map[u - this.minU]

		if (universe == null)
		{
			return null
		}

		return universe[t]
	}

	addBoard(u: number, board: ChessBoard)
	{
		const universe = this.map[u - this.minU]

		universe.push(board)
	}

	update()
	{
		const map = document.createElement('div')
		map.classList.add('map')

		for (let y = 0; y < this.map.length; y++)
		{
			let row = document.createElement('div')
			row.className = 'row'

			for (let x = 0; x < this.map[y].length; x++)
			{
				if (this.map[y][x] == null)
				{
					row.insertAdjacentHTML('beforeend', /* html */ `
					<div class='empty board'></div>
					`)

					continue
				}

				const board = this.map[y][x].render()
				row.appendChild(board)
			}

			map.appendChild(row)
		}

		this.mapEl.innerHTML = ''
		this.mapEl.appendChild(map)
	}

	clone(chessBoard: ChessBoard)
	{
		let { t, u } = chessBoard.boardMapPos
		const newPos = chessBoard.boardMapPos.clone()
		newPos.t++

		const nextTurn = chessBoard.turn == Colour.White
			? Colour.Black
			: Colour.White

		const newBoard = new ChessBoard(this, newPos,
			chessBoard.clonePieces(), nextTurn)

		newBoard.legalStuff = chessBoard.legalStuff.clone(newBoard)

		// We either add a new board to the current universe,
		// or create a new universe if the current universe already
		// has a next board.

		t++

		if (this.get(t, u) == null)
		{
			// We can attach the new board to the current universe.

			this.addBoard(u, newBoard)

			return newBoard
		}

		// We have to create a new universe.

		const newUniverse = Array(t).fill(null)
		newUniverse.push(newBoard)

		if (chessBoard.turn == Colour.White)
		{
			// Append at the end for white.

			this.map.push(newUniverse)
			newPos.u = this.maxU
		}
		else
		{
			// Prepend to the beginning for black.

			this.minU--
			this.map.unshift(newUniverse)
			newPos.u = this.minU
		}


		return newBoard
	}
}