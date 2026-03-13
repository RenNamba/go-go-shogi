import { PIECE_NAMES, PROMOTED_PIECE_NAMES } from '../game/constants.js';
import './Piece.css';

export default function Piece({ piece, flipped }) {
  if (!piece) return null;

  const { type, owner, promoted } = piece;
  const displayName = promoted ? PROMOTED_PIECE_NAMES[type] : PIECE_NAMES[type];
  // 通常: 後手が回転。反転時: 先手が回転（画面上側の駒を回転させる）
  const isUpsideDown = flipped ? owner === 'sente' : owner === 'gote';

  return (
    <div
      className={`piece ${isUpsideDown ? 'piece--rotated' : ''} ${promoted ? 'piece--promoted' : ''}`}
    >
      <div className="piece-shape">
        <span className="piece-text">{displayName}</span>
      </div>
    </div>
  );
}
