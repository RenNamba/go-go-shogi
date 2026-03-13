import { GAME_STATUS } from '../game/constants.js';

export default function GameOverDialog({ gameStatus, mode, playerSide, onClose }) {
  let message = '';

  if (gameStatus === GAME_STATUS.DRAW) {
    message = '引き分け';
  } else if (mode === 'cpu') {
    // CPU対戦: 「あなた」「CPU」を表示
    const winnerSide = gameStatus === GAME_STATUS.SENTE_WIN ? 'sente' : 'gote';
    const winnerIcon = winnerSide === 'sente' ? '☗' : '☖';
    const winnerLabel = winnerSide === 'sente' ? '先手' : '後手';
    const winnerRole = winnerSide === playerSide ? 'あなた' : 'CPU';
    message = `${winnerIcon} ${winnerLabel}（${winnerRole}）の勝ち！`;
  } else {
    // 2人対戦
    if (gameStatus === GAME_STATUS.SENTE_WIN) {
      message = '☗ 先手の勝ち！';
    } else if (gameStatus === GAME_STATUS.GOTE_WIN) {
      message = '☖ 後手の勝ち！';
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <p className="modal-title">対局終了</p>
        <p className="modal-message modal-message--large">{message}</p>
        <div className="modal-buttons">
          <button className="modal-btn" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
