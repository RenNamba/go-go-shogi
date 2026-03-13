import { GAME_STATUS } from '../game/constants.js';

export default function GameOverDialog({ gameStatus, onRestart, onTitle }) {
  let message = '';
  if (gameStatus === GAME_STATUS.SENTE_WIN) {
    message = '☗ 先手の勝ち！';
  } else if (gameStatus === GAME_STATUS.GOTE_WIN) {
    message = '☖ 後手の勝ち！';
  } else if (gameStatus === GAME_STATUS.DRAW) {
    message = '引き分け';
  }

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <p className="modal-title">対局終了</p>
        <p className="modal-message modal-message--large">{message}</p>
        <div className="modal-buttons">
          <button className="modal-btn modal-btn--primary" onClick={onRestart}>
            もう一度
          </button>
          <button className="modal-btn" onClick={onTitle}>
            タイトルに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
