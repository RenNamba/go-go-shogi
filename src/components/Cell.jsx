import Piece from './Piece.jsx';

export default function Cell({ piece, isSelected, isLegalMove, onClick, flipped }) {
  return (
    <div
      className={`cell ${isSelected ? 'cell--selected' : ''} ${isLegalMove ? 'cell--legal' : ''}`}
      onClick={onClick}
    >
      {piece && <Piece piece={piece} flipped={flipped} />}
      {isLegalMove && !piece && <div className="cell-legal-dot" />}
      {isLegalMove && piece && <div className="cell-legal-capture" />}
    </div>
  );
}
