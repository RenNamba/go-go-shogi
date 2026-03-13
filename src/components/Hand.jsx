import { PIECE_NAMES, HAND_PIECE_ORDER } from '../game/constants.js';
import './Hand.css';

export default function Hand({ player, hand, selectedHand, onHandClick, label }) {
  const isGote = player === 'gote';

  return (
    <div className={`hand ${isGote ? 'hand--gote' : 'hand--sente'}`}>
      <span className="hand-label">{label}</span>
      <span className="hand-caption">持駒:</span>
      <div className="hand-pieces">
        {HAND_PIECE_ORDER.map(type => {
          const count = hand[type];
          if (count <= 0) return null;
          const isSelected = selectedHand && selectedHand.type === type;
          return (
            <button
              key={type}
              className={`hand-piece ${isSelected ? 'hand-piece--selected' : ''}`}
              onClick={() => onHandClick(type)}
            >
              <span className="hand-piece-name">{PIECE_NAMES[type]}</span>
              {count > 1 && <span className="hand-piece-count">{count}</span>}
            </button>
          );
        })}
        {HAND_PIECE_ORDER.every(type => hand[type] <= 0) && (
          <span className="hand-empty">なし</span>
        )}
      </div>
    </div>
  );
}
