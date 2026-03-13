import './RuleSettings.css';

export default function RuleSettings({ rules, onChangeRules, onBack }) {
  return (
    <div className="rule-settings">
      <h2 className="rule-settings-title">ルール設定</h2>

      <div className="rule-settings-option">
        <p className="rule-settings-label">千日手:</p>
        <label className="radio-label">
          <input
            type="radio"
            name="repetition"
            value="gote_win"
            checked={rules.repetitionRule === 'gote_win'}
            onChange={() => onChangeRules({ ...rules, repetitionRule: 'gote_win' })}
          />
          後手の勝ち
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="repetition"
            value="draw"
            checked={rules.repetitionRule === 'draw'}
            onChange={() => onChangeRules({ ...rules, repetitionRule: 'draw' })}
          />
          引き分け
        </label>
      </div>

      <div className="rule-settings-buttons">
        <button className="mode-btn mode-btn--sub" onClick={onBack}>
          戻る
        </button>
      </div>
    </div>
  );
}
