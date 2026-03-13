import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createInitialBoard,
  createInitialHands,
  GAME_STATUS,
} from '../game/constants.js';
import {
  getLegalMovesForPiece,
  getLegalDropSquares,
  isInCheck,
  isCheckmate,
  canPromote,
  mustPromote,
  movePiece,
  promotePiece,
  dropPiece,
  generatePositionHash,
  checkRepetition,
} from '../game/gameLogic.js';
import { getCpuMove } from '../game/cpu.js';

export default function useGame() {
  const [board, setBoard] = useState(createInitialBoard);
  const [currentPlayer, setCurrentPlayer] = useState('sente');
  const [hands, setHands] = useState(createInitialHands);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedHand, setSelectedHand] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING);
  const [mode, setMode] = useState(null);
  const [playerSide, setPlayerSide] = useState('sente');
  const [positionHistory, setPositionHistory] = useState([]);
  const [moveCount, setMoveCount] = useState(0);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [isCpuThinking, setIsCpuThinking] = useState(false);
  const [rules, setRules] = useState({ repetitionRule: 'gote_win' });

  const rulesRef = useRef(rules);
  rulesRef.current = rules;

  // ゲーム初期化
  const initGame = useCallback((gameMode, side = 'sente') => {
    setBoard(createInitialBoard());
    setHands(createInitialHands());
    setCurrentPlayer('sente');
    setSelectedCell(null);
    setSelectedHand(null);
    setLegalMoves([]);
    setGameStatus(GAME_STATUS.PLAYING);
    setMode(gameMode);
    setPlayerSide(side);
    setPositionHistory([]);
    setMoveCount(0);
    setPendingPromotion(null);
    setIsCpuThinking(false);
  }, []);

  // 手番後の共通処理
  const afterMove = useCallback((newBoard, newHands, nextPlayer, history) => {
    // 千日手チェック
    const hash = generatePositionHash(newBoard, newHands, nextPlayer);
    const newHistory = [...history, hash];

    if (checkRepetition(newHistory, hash)) {
      const rule = rulesRef.current.repetitionRule;
      setBoard(newBoard);
      setHands(newHands);
      setPositionHistory(newHistory);
      setGameStatus(rule === 'draw' ? GAME_STATUS.DRAW : GAME_STATUS.GOTE_WIN);
      return;
    }

    // 詰みチェック
    if (isCheckmate(newBoard, newHands, nextPlayer)) {
      const winner = nextPlayer === 'sente' ? GAME_STATUS.GOTE_WIN : GAME_STATUS.SENTE_WIN;
      setBoard(newBoard);
      setHands(newHands);
      setPositionHistory(newHistory);
      setGameStatus(winner);
      return;
    }

    setBoard(newBoard);
    setHands(newHands);
    setCurrentPlayer(nextPlayer);
    setPositionHistory(newHistory);
    setMoveCount(prev => prev + 1);
  }, []);

  // 盤面の駒を移動実行
  const executeMove = useCallback((fromRow, fromCol, toRow, toCol, shouldPromote) => {
    const { newBoard, newHands } = movePiece(board, hands, fromRow, fromCol, toRow, toCol);
    let finalBoard = newBoard;
    if (shouldPromote) {
      finalBoard = promotePiece(newBoard, toRow, toCol);
    }
    const nextPlayer = currentPlayer === 'sente' ? 'gote' : 'sente';
    afterMove(finalBoard, newHands, nextPlayer, positionHistory);
    setSelectedCell(null);
    setSelectedHand(null);
    setLegalMoves([]);
  }, [board, hands, currentPlayer, positionHistory, afterMove]);

  // マスをクリック
  const onCellClick = useCallback((row, col) => {
    if (gameStatus !== GAME_STATUS.PLAYING) return;
    if (isCpuThinking) return;
    if (pendingPromotion) return;

    // CPU対戦で相手の手番のときは操作不可
    if (mode === 'cpu' && currentPlayer !== playerSide) return;

    const clickedPiece = board[row][col];

    // 持ち駒が選択されている場合
    if (selectedHand) {
      const isLegal = legalMoves.some(m => m.row === row && m.col === col);
      if (isLegal) {
        const { newBoard, newHands } = dropPiece(
          board, hands, currentPlayer, selectedHand.type, row, col
        );
        const nextPlayer = currentPlayer === 'sente' ? 'gote' : 'sente';
        afterMove(newBoard, newHands, nextPlayer, positionHistory);
        setSelectedCell(null);
        setSelectedHand(null);
        setLegalMoves([]);
        return;
      }
      // 自分の駒をクリックした場合は選択切り替え
      if (clickedPiece && clickedPiece.owner === currentPlayer) {
        setSelectedHand(null);
        setSelectedCell({ row, col });
        setLegalMoves(getLegalMovesForPiece(board, row, col));
        return;
      }
      // それ以外は選択解除
      setSelectedHand(null);
      setLegalMoves([]);
      return;
    }

    // 駒が選択されている場合
    if (selectedCell) {
      // 移動先をクリック
      const isLegal = legalMoves.some(m => m.row === row && m.col === col);
      if (isLegal) {
        const piece = board[selectedCell.row][selectedCell.col];
        const mp = mustPromote(piece, row);
        const cp = canPromote(piece, selectedCell.row, row);

        if (mp) {
          executeMove(selectedCell.row, selectedCell.col, row, col, true);
        } else if (cp) {
          setPendingPromotion({
            from: { row: selectedCell.row, col: selectedCell.col },
            to: { row, col },
          });
        } else {
          executeMove(selectedCell.row, selectedCell.col, row, col, false);
        }
        return;
      }

      // 自分の別の駒をクリック → 選択切り替え
      if (clickedPiece && clickedPiece.owner === currentPlayer) {
        if (selectedCell.row === row && selectedCell.col === col) {
          // 同じ駒をクリック → 選択解除
          setSelectedCell(null);
          setLegalMoves([]);
        } else {
          setSelectedCell({ row, col });
          setLegalMoves(getLegalMovesForPiece(board, row, col));
        }
        return;
      }

      // 選択解除
      setSelectedCell(null);
      setLegalMoves([]);
      return;
    }

    // 何も選択されていない場合 → 自分の駒を選択
    if (clickedPiece && clickedPiece.owner === currentPlayer) {
      setSelectedCell({ row, col });
      setLegalMoves(getLegalMovesForPiece(board, row, col));
    }
  }, [
    board, hands, currentPlayer, selectedCell, selectedHand, legalMoves,
    gameStatus, mode, playerSide, isCpuThinking, pendingPromotion,
    positionHistory, afterMove, executeMove,
  ]);

  // 持ち駒をクリック
  const onHandClick = useCallback((player, pieceType) => {
    if (gameStatus !== GAME_STATUS.PLAYING) return;
    if (isCpuThinking) return;
    if (pendingPromotion) return;
    if (player !== currentPlayer) return;
    if (mode === 'cpu' && currentPlayer !== playerSide) return;

    if (selectedHand && selectedHand.type === pieceType) {
      // 同じ持ち駒をクリック → 選択解除
      setSelectedHand(null);
      setLegalMoves([]);
      return;
    }

    setSelectedCell(null);
    setSelectedHand({ type: pieceType });
    setLegalMoves(getLegalDropSquares(board, hands, currentPlayer, pieceType));
  }, [
    board, hands, currentPlayer, selectedHand, gameStatus, mode, playerSide,
    isCpuThinking, pendingPromotion,
  ]);

  // 成り確認の応答
  const onPromotionAnswer = useCallback((shouldPromote) => {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    executeMove(from.row, from.col, to.row, to.col, shouldPromote);
  }, [pendingPromotion, executeMove]);

  // CPU思考
  useEffect(() => {
    if (mode !== 'cpu') return;
    if (gameStatus !== GAME_STATUS.PLAYING) return;
    if (currentPlayer === playerSide) return;
    if (pendingPromotion) return;

    setIsCpuThinking(true);

    const timerId = setTimeout(() => {
      const cpuSide = playerSide === 'sente' ? 'gote' : 'sente';
      const move = getCpuMove(board, hands, cpuSide);

      if (!move) {
        setIsCpuThinking(false);
        return;
      }

      if (move.type === 'move') {
        const { newBoard, newHands } = movePiece(
          board, hands, move.from.row, move.from.col, move.to.row, move.to.col
        );
        let finalBoard = newBoard;
        if (move.promote) {
          finalBoard = promotePiece(newBoard, move.to.row, move.to.col);
        }
        const nextPlayer = cpuSide === 'sente' ? 'gote' : 'sente';
        afterMove(finalBoard, newHands, nextPlayer, positionHistory);
      } else {
        const { newBoard, newHands } = dropPiece(
          board, hands, cpuSide, move.pieceType, move.to.row, move.to.col
        );
        const nextPlayer = cpuSide === 'sente' ? 'gote' : 'sente';
        afterMove(newBoard, newHands, nextPlayer, positionHistory);
      }

      setIsCpuThinking(false);
    }, 300);

    return () => clearTimeout(timerId);
  }, [mode, gameStatus, currentPlayer, playerSide, board, hands, positionHistory, pendingPromotion, afterMove]);

  return {
    board,
    currentPlayer,
    hands,
    selectedCell,
    selectedHand,
    legalMoves,
    gameStatus,
    mode,
    playerSide,
    moveCount,
    pendingPromotion,
    isCpuThinking,
    rules,
    isCheck: gameStatus === GAME_STATUS.PLAYING && isInCheck(board, currentPlayer),
    initGame,
    onCellClick,
    onHandClick,
    onPromotionAnswer,
    setRules,
  };
}
