export default function PromotionDialog({ onPromote, onDecline }) {
  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <p className="modal-message">成りますか？</p>
        <div className="modal-buttons">
          <button className="modal-btn modal-btn--primary" onClick={onPromote}>
            はい
          </button>
          <button className="modal-btn" onClick={onDecline}>
            いいえ
          </button>
        </div>
      </div>
    </div>
  );
}
