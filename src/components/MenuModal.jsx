import './MenuModal.css';

export default function MenuModal({ onRestart, onTitle, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <p className="modal-title">メニュー</p>
        <div className="modal-buttons modal-buttons--vertical">
          <button className="modal-btn" onClick={onRestart}>
            再対局
          </button>
          <button className="modal-btn" onClick={onTitle}>
            タイトルに戻る
          </button>
          <button className="modal-btn modal-btn--secondary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
