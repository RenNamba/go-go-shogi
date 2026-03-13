import { BOARD_SIZE } from '../game/constants.js';
import Cell from './Cell.jsx';
import './Board.css';

const COL_LABELS = ['5', '4', '3', '2', '1'];
const ROW_LABELS = ['一', '二', '三', '四', '五'];

export default function Board({ board, selectedCell, legalMoves, onCellClick }) {
  const isLegalMove = (row, col) =>
    legalMoves.some(m => m.row === row && m.col === col);

  return (
    <div className="board-wrapper">
      {/* 筋の番号（上部） */}
      <div className="board-col-labels">
        {COL_LABELS.map((label, i) => (
          <span key={i} className="board-label">{label}</span>
        ))}
      </div>

      <div className="board-with-rows">
        {/* 盤面 */}
        <div className="board">
          {Array.from({ length: BOARD_SIZE }, (_, row) =>
            Array.from({ length: BOARD_SIZE }, (_, col) => (
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
              />
            ))
          )}
        </div>

        {/* 段の番号（右側） */}
        <div className="board-row-labels">
          {ROW_LABELS.map((label, i) => (
            <span key={i} className="board-label">{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
