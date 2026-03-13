import { PIECE_NAMES, PROMOTED_PIECE_NAMES } from '../game/constants.js';
import './Piece.css';

export default function Piece({ piece }) {
  if (!piece) return null;

  const { type, owner, promoted } = piece;
  const displayName = promoted ? PROMOTED_PIECE_NAMES[type] : PIECE_NAMES[type];
  const isGote = owner === 'gote';

  return (
    <div
      className={`piece ${isGote ? 'piece--gote' : 'piece--sente'} ${promoted ? 'piece--promoted' : ''}`}
    >
      <div className="piece-shape">
        <span className="piece-text">{displayName}</span>
      </div>
    </div>
  );
}
