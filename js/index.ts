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
	map = new ChessBoardMap(Colour.White, document.querySelector('.chess-board-map'))
})