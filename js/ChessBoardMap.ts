/**
 * Class representing the map of all chess boards.
 * Holds the entire 5D map of individual chess boards.
 */
class ChessBoardMap
{
	mapEl: HTMLElement
	root: ChessBoard
	map: ChessBoard[][] = []
	minTimeline = 0
	player: Colour

	constructor(player: Colour, mapEl: HTMLElement)
	{
		this.player = player
		this.root = ChessBoard.generateDefault(this, [ 0, 0 ], Colour.White)
		this.root.legalStuff = new ChessBoardLegalStuff(this.root)
		this.map = [ [ this.root ] ]
		this.mapEl = mapEl

		this.update()
	}

	get(x: number, y: number)
	{
		return this.map[y - this.minTimeline][x]
	}

	update()
	{
		const map = document.createElement('div')
		map.classList.add('map')

		for (let y = 0; y < this.minTimeline + this.map.length; y++)
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

		this.map[newPos[1] - this.minTimeline][newPos[0]] = newBoard

		return newBoard
	}
}