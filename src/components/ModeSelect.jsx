import './ModeSelect.css';

export default function ModeSelect({ onSelectPvp, onSelectCpu, onOpenRules, onOpenSettings }) {
  return (
    <div className="mode-select">
      <h1 className="mode-select-title">
        <span className="title-icon">☗</span>
        5五将棋
        <span className="title-icon">☖</span>
      </h1>
      <div className="mode-select-buttons">
        <button className="mode-btn" onClick={onSelectPvp}>
          2人対戦
        </button>
        <button className="mode-btn" onClick={onSelectCpu}>
          CPU対戦
        </button>
        <button className="mode-btn mode-btn--sub" onClick={onOpenSettings}>
          ルール設定
        </button>
        <button className="mode-btn mode-btn--sub" onClick={onOpenRules}>
          遊び方
        </button>
      </div>
    </div>
  );
}
