import { BOARD_SIZE, PIECE_VALUES, PROMOTED_BONUS } from './constants.js';
import {
  getAllLegalMoves,
  movePiece,
  promotePiece,
  dropPiece,
  cloneHands,
  isInCheck,
} from './gameLogic.js';

// 位置評価テーブル（中央ほど高評価）
const POSITION_BONUS = [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 1, 2, 1, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0],
];

/**
 * 盤面の評価関数
 * 正の値 = sente有利、負の値 = gote有利
 */
function evaluate(board, hands) {
  let score = 0;

  // 盤上の駒の評価
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let value = PIECE_VALUES[piece.type];
      if (piece.promoted && PROMOTED_BONUS[piece.type]) {
        value += PROMOTED_BONUS[piece.type];
      }
      value += POSITION_BONUS[r][c] * 0.1;

      score += piece.owner === 'sente' ? value : -value;
    }
  }

  // 持ち駒の評価（盤上より少し低めに）
  for (const pieceType of Object.keys(hands.sente)) {
    score += hands.sente[pieceType] * PIECE_VALUES[pieceType] * 0.9;
  }
  for (const pieceType of Object.keys(hands.gote)) {
    score -= hands.gote[pieceType] * PIECE_VALUES[pieceType] * 0.9;
  }

  return score;
}

/**
 * 手を適用して新しい盤面を返す
 */
function applyMove(board, hands, move, player) {
  if (move.type === 'move') {
    const { newBoard, newHands } = movePiece(
      board, hands, move.from.row, move.from.col, move.to.row, move.to.col
    );
    if (move.promote) {
      return { board: promotePiece(newBoard, move.to.row, move.to.col), hands: newHands };
    }
    return { board: newBoard, hands: newHands };
  } else {
    const { newBoard, newHands } = dropPiece(
      board, hands, player, move.pieceType, move.to.row, move.to.col
    );
    return { board: newBoard, hands: newHands };
  }
}

/**
 * ミニマックス法 + アルファベータ枝刈り
 */
function minimax(board, hands, depth, alpha, beta, isMaximizing, player) {
  if (depth === 0) {
    return { score: evaluate(board, hands), move: null };
  }

  const moves = getAllLegalMoves(board, hands, player);

  // 合法手がない = 詰み
  if (moves.length === 0) {
    if (isInCheck(board, player)) {
      // 詰まされている: 負け
      return { score: isMaximizing ? -99999 + depth : 99999 - depth, move: null };
    }
    // ステイルメート（5五将棋では基本的に発生しないが念のため）
    return { score: 0, move: null };
  }

  let bestMove = moves[0];

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      const { board: newBoard, hands: newHands } = applyMove(board, hands, move, player);
      const opponent = player === 'sente' ? 'gote' : 'sente';
      const { score } = minimax(newBoard, newHands, depth - 1, alpha, beta, false, opponent);

      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      const { board: newBoard, hands: newHands } = applyMove(board, hands, move, player);
      const opponent = player === 'sente' ? 'gote' : 'sente';
      const { score } = minimax(newBoard, newHands, depth - 1, alpha, beta, true, opponent);

      if (score < minScore) {
        minScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return { score: minScore, move: bestMove };
  }
}

/**
 * CPUの最善手を計算する
 * @param {string} cpuSide - CPUが担当する側 ('sente' | 'gote')
 * @param {number} depth - 探索深さ（デフォルト: 4）
 * @returns {object|null} 最善手
 */
export function getCpuMove(board, hands, cpuSide, depth = 4) {
  const isMaximizing = cpuSide === 'sente';
  const { move } = minimax(board, hands, depth, -Infinity, Infinity, isMaximizing, cpuSide);
  return move;
}
