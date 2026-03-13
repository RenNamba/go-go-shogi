import { BOARD_SIZE } from '../game/constants.js';
import Cell from './Cell.jsx';
import './Board.css';

const COL_LABELS = ['5', '4', '3', '2', '1'];
const ROW_LABELS = ['一', '二', '三', '四', '五'];

export default function Board({ board, selectedCell, legalMoves, onCellClick, flipped }) {
  const isLegalMove = (row, col) =>
    legalMoves.some(m => m.row === row && m.col === col);

  // 反転時は行・列の順序を逆にする
  const rows = flipped
    ? Array.from({ length: BOARD_SIZE }, (_, i) => BOARD_SIZE - 1 - i)
    : Array.from({ length: BOARD_SIZE }, (_, i) => i);
  const cols = flipped
    ? Array.from({ length: BOARD_SIZE }, (_, i) => BOARD_SIZE - 1 - i)
    : Array.from({ length: BOARD_SIZE }, (_, i) => i);

  const colLabels = flipped ? [...COL_LABELS].reverse() : COL_LABELS;
  const rowLabels = flipped ? [...ROW_LABELS].reverse() : ROW_LABELS;

  return (
    <div className="board-wrapper">
      {/* 筋の番号（上部） */}
      <div className="board-col-labels">
        {colLabels.map((label, i) => (
          <span key={i} className="board-label">{label}</span>
        ))}
      </div>

      <div className="board-with-rows">
        {/* 盤面 */}
        <div className="board">
          {rows.map(row =>
            cols.map(col => (
              <Cell
                key={`${row}-${col}`}
                piece={board[row][col]}
                isSelected={
                  selectedCell !== null &&
                  selectedCell.row === row &&
                  selectedCell.col === col
                }
                isLegalMove={isLegalMove(row, col)}
                onClick={() => onCellClick(row, col)}
                flipped={flipped}
              />
            ))
          )}
        </div>

        {/* 段の番号（右側） */}
        <div className="board-row-labels">
          {rowLabels.map((label, i) => (
            <span key={i} className="board-label">{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
