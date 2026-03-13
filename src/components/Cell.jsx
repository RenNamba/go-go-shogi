import Piece from './Piece.jsx';

export default function Cell({ piece, isSelected, isLegalMove, onClick }) {
  return (
    <div
      className={`cell ${isSelected ? 'cell--selected' : ''} ${isLegalMove ? 'cell--legal' : ''}`}
      onClick={onClick}
    >
      {piece && <Piece piece={piece} />}
      {isLegalMove && !piece && <div className="cell-legal-dot" />}
      {isLegalMove && piece && <div className="cell-legal-capture" />}
    </div>
  );
}
