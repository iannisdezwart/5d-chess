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
	player: Colour

	draggingPiece: HTMLElement
	draggingPieceSquare: Square5D

	constructor(player: Colour, mapEl: HTMLElement)
	{
		this.player = player
		this.root = ChessBoard.generateDefault(this, [ 0, 0 ], Colour.White)
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
		const boardPos = target.getAttribute('data-board-position')
			.split(', ').map(x => +x)
		const board = this.map[boardPos[1]][boardPos[0]]

		const xSel = Math.floor((clientX - boardRect.x) / boardRect.width * 8)
		const ySel = Math.floor((clientY - boardRect.y) / boardRect.height * 8)

		const [ x, y ] = board.translatePointerPositionToSquare(xSel, ySel)
		return new Square5D(x, y, boardPos[0], boardPos[1], this)
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

	update()
	{
		const map = document.createElement('div')
		map.classList.add('map')

		for (let y = 0; y < this.minU + this.map.length; y++)
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

					return
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
		const newPos = chessBoard.boardMapPos.slice()
		newPos[0]++

		const nextTurn = chessBoard.turn == Colour.White
			? Colour.Black
			: Colour.White

		const newBoard = new ChessBoard(this, newPos,
			chessBoard.clonePieces(), nextTurn)

		newBoard.legalStuff = chessBoard.legalStuff.clone(newBoard)

		this.map[newPos[1] - this.minU][newPos[0]] = newBoard

		return newBoard
	}
}