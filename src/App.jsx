import { useState } from 'react';
import useGame from './hooks/useGame.js';
import ModeSelect from './components/ModeSelect.jsx';
import CpuSetup from './components/CpuSetup.jsx';
import RuleSettings from './components/RuleSettings.jsx';
import Board from './components/Board.jsx';
import Hand from './components/Hand.jsx';
import GameInfo from './components/GameInfo.jsx';
import PromotionDialog from './components/PromotionDialog.jsx';
import GameOverDialog from './components/GameOverDialog.jsx';
import MenuModal from './components/MenuModal.jsx';
import RulesModal from './components/RulesModal.jsx';
import { GAME_STATUS } from './game/constants.js';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('title');
  const [showMenu, setShowMenu] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showGameOver, setShowGameOver] = useState(true);

  const game = useGame();

  const handleSelectPvp = () => {
    game.initGame('pvp');
    setScreen('game');
  };

  const handleSelectCpu = () => {
    setScreen('cpu-setup');
  };

  const handleCpuStart = (side) => {
    game.initGame('cpu', side);
    setScreen('game');
  };

  const handleRestart = () => {
    game.initGame(game.mode, game.playerSide);
    setShowMenu(false);
    setShowGameOver(true);
  };

  const handleTitle = () => {
    setScreen('title');
    setShowMenu(false);
    setShowGameOver(true);
  };

  // タイトル画面
  if (screen === 'title') {
    return (
      <>
        <ModeSelect
          onSelectPvp={handleSelectPvp}
          onSelectCpu={handleSelectCpu}
          onOpenRules={() => setShowRules(true)}
          onOpenSettings={() => setScreen('settings')}
        />
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </>
    );
  }

  // CPU設定画面
  if (screen === 'cpu-setup') {
    return (
      <CpuSetup
        onStart={handleCpuStart}
        onBack={() => setScreen('title')}
      />
    );
  }

  // ルール設定画面
  if (screen === 'settings') {
    return (
      <RuleSettings
        rules={game.rules}
        onChangeRules={game.setRules}
        onBack={() => setScreen('title')}
      />
    );
  }

  // ゲーム画面
  const isGameOver = game.gameStatus !== GAME_STATUS.PLAYING;
  // CPU対戦で後手を選んだ場合、盤面を反転（自分を下側にする）
  const flipped = game.mode === 'cpu' && game.playerSide === 'gote';

  // 画面上側（相手側）と下側（自分側）の持ち駒を決定
  const topPlayer = flipped ? 'sente' : 'gote';
  const bottomPlayer = flipped ? 'gote' : 'sente';
  const topLabel = flipped ? '☗ 先手' : '☖ 後手';
  const bottomLabel = flipped ? '☖ 後手' : '☗ 先手';

  return (
    <div className="game-screen">
      {/* ヘッダー */}
      <header className="game-header">
        <span className="game-header-title">☗ 5五将棋</span>
        <div className="game-header-buttons">
          <button
            className="header-btn"
            onClick={() => setShowRules(true)}
            aria-label="ルール"
          >
            ?
          </button>
          <button
            className="header-btn"
            onClick={() => setShowMenu(true)}
            aria-label="メニュー"
          >
            ≡
          </button>
        </div>
      </header>

      {/* 上側の持ち駒（相手側） */}
      <Hand
        player={topPlayer}
        hand={game.hands[topPlayer]}
        selectedHand={game.currentPlayer === topPlayer ? game.selectedHand : null}
        onHandClick={(type) => game.onHandClick(topPlayer, type)}
        label={topLabel}
      />

      {/* 盤面 */}
      <Board
        board={game.board}
        selectedCell={game.selectedCell}
        legalMoves={game.legalMoves}
        onCellClick={game.onCellClick}
        flipped={flipped}
      />

      {/* 下側の持ち駒（自分側） */}
      <Hand
        player={bottomPlayer}
        hand={game.hands[bottomPlayer]}
        selectedHand={game.currentPlayer === bottomPlayer ? game.selectedHand : null}
        onHandClick={(type) => game.onHandClick(bottomPlayer, type)}
        label={bottomLabel}
      />

      {/* 手番表示 */}
      <GameInfo
        currentPlayer={game.currentPlayer}
        isCheck={game.isCheck}
        isCpuThinking={game.isCpuThinking}
      />

      {/* 成り確認ダイアログ */}
      {game.pendingPromotion && (
        <PromotionDialog
          onPromote={() => game.onPromotionAnswer(true)}
          onDecline={() => game.onPromotionAnswer(false)}
        />
      )}

      {/* 終局ダイアログ */}
      {isGameOver && showGameOver && (
        <GameOverDialog
          gameStatus={game.gameStatus}
          onClose={() => setShowGameOver(false)}
        />
      )}

      {/* メニューモーダル */}
      {showMenu && (
        <MenuModal
          onRestart={handleRestart}
          onTitle={handleTitle}
          onClose={() => setShowMenu(false)}
        />
      )}

      {/* ルールモーダル */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
