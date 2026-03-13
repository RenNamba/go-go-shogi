import { useState } from 'react';
import './CpuSetup.css';

export default function CpuSetup({ onStart, onBack }) {
  const [playerSide, setPlayerSide] = useState('sente');

  return (
    <div className="cpu-setup">
      <h2 className="cpu-setup-title">CPU対戦設定</h2>

      <div className="cpu-setup-option">
        <p className="cpu-setup-label">あなたの手番:</p>
        <label className="radio-label">
          <input
            type="radio"
            name="side"
            value="sente"
            checked={playerSide === 'sente'}
            onChange={() => setPlayerSide('sente')}
          />
          先手（☗）
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="side"
            value="gote"
            checked={playerSide === 'gote'}
            onChange={() => setPlayerSide('gote')}
          />
          後手（☖）
        </label>
      </div>

      <div className="cpu-setup-buttons">
        <button className="mode-btn" onClick={() => onStart(playerSide)}>
          対局開始
        </button>
        <button className="mode-btn mode-btn--sub" onClick={onBack}>
          戻る
        </button>
      </div>
    </div>
  );
}
