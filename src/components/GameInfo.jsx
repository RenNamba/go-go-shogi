export default function GameInfo({ currentPlayer, isCheck, isCpuThinking }) {
  const label = currentPlayer === 'sente' ? '☗ 先手' : '☖ 後手';

  return (
    <div className="game-info">
      {isCpuThinking ? (
        <span className="game-info-text">CPU思考中...</span>
      ) : (
        <span className="game-info-text">
          ▶ {label}の番{isCheck ? '（王手！）' : ''}
        </span>
      )}
    </div>
  );
}
