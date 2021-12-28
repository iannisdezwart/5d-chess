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

let map: ChessBoardMap

addEventListener('DOMContentLoaded', () => {
	const mapEl = document.querySelector('.chess-board-map') as HTMLElement
	map = new ChessBoardMap(Colour.White, mapEl)

	const MOUSE_MAP_MOVE_THRESHOLD = 0.1
	const MOUSE_MAP_MOVE_PX_PER_FRAME = 5

	const curPointerPos = [ innerWidth / 2, innerHeight / 2 ]

	const handleMouseScroll = () =>
	{
		const [ x, y ] = curPointerPos

		if (x < MOUSE_MAP_MOVE_THRESHOLD * innerWidth)
		{
			scrollBy({
				left: -MOUSE_MAP_MOVE_PX_PER_FRAME
			})
		}

		if (x > (1 - MOUSE_MAP_MOVE_THRESHOLD) * innerWidth)
		{
			scrollBy({
				left: MOUSE_MAP_MOVE_PX_PER_FRAME
			})
		}

		if (y < MOUSE_MAP_MOVE_THRESHOLD * innerHeight)
		{
			scrollBy({
				top: -MOUSE_MAP_MOVE_PX_PER_FRAME
			})
		}

		if (y > (1 - MOUSE_MAP_MOVE_THRESHOLD) * innerHeight)
		{
			scrollBy({
				top: MOUSE_MAP_MOVE_PX_PER_FRAME
			})
		}

		requestAnimationFrame(handleMouseScroll)
	}

	handleMouseScroll()

	addEventListener('mousemove', e =>
	{
		curPointerPos[0] = e.clientX
		curPointerPos[1] = e.clientY
	})
})
