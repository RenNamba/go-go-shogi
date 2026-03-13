import { BOARD_SIZE } from './constants.js';

// 移動方向の定義
// [dRow, dCol] - 先手視点（先手の「前」= row が減る方向）
const DIRECTIONS = {
  // 8方向
  UP: [-1, 0],
  DOWN: [1, 0],
  LEFT: [0, -1],
  RIGHT: [0, 1],
  UP_LEFT: [-1, -1],
  UP_RIGHT: [-1, 1],
  DOWN_LEFT: [1, -1],
  DOWN_RIGHT: [1, 1],
};

// 先手視点での各駒の移動方向（短距離駒: 1マスのみ）
const SHORT_RANGE_MOVES = {
  king: [
    DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT,
    DIRECTIONS.UP_LEFT, DIRECTIONS.UP_RIGHT, DIRECTIONS.DOWN_LEFT, DIRECTIONS.DOWN_RIGHT,
  ],
  gold: [
    DIRECTIONS.UP, DIRECTIONS.UP_LEFT, DIRECTIONS.UP_RIGHT,
    DIRECTIONS.LEFT, DIRECTIONS.RIGHT,
    DIRECTIONS.DOWN,
  ],
  silver: [
    DIRECTIONS.UP, DIRECTIONS.UP_LEFT, DIRECTIONS.UP_RIGHT,
    DIRECTIONS.DOWN_LEFT, DIRECTIONS.DOWN_RIGHT,
  ],
  pawn: [
    DIRECTIONS.UP,
  ],
};

// 長距離駒の移動方向（何マスでも進める）
const LONG_RANGE_MOVES = {
  bishop: [
    DIRECTIONS.UP_LEFT, DIRECTIONS.UP_RIGHT,
    DIRECTIONS.DOWN_LEFT, DIRECTIONS.DOWN_RIGHT,
  ],
  rook: [
    DIRECTIONS.UP, DIRECTIONS.DOWN,
    DIRECTIONS.LEFT, DIRECTIONS.RIGHT,
  ],
};

// 成り駒の追加移動（長距離駒に短距離の補助移動を追加）
const PROMOTED_EXTRA_MOVES = {
  bishop: [
    DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT,
  ],
  rook: [
    DIRECTIONS.UP_LEFT, DIRECTIONS.UP_RIGHT, DIRECTIONS.DOWN_LEFT, DIRECTIONS.DOWN_RIGHT,
  ],
};

/**
 * 後手の場合、移動方向を反転する
 */
function flipDirection(dir, owner) {
  if (owner === 'gote') {
    return [-dir[0], -dir[1]];
  }
  return dir;
}

/**
 * 盤面内かどうかを判定
 */
export function isInBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * 指定位置の駒の移動候補マスを計算する
 * 味方駒のマスは除外、敵駒のマスは含む（取れる）
 * 王手の考慮はしない（合法手判定は gameLogic.js で行う）
 *
 * @returns {Array<{row: number, col: number}>} 移動候補マスのリスト
 */
export function getRawMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const { type, owner, promoted } = piece;
  const moves = [];

  // 成り駒の銀・歩は金の動き
  if (promoted && (type === 'silver' || type === 'pawn')) {
    const dirs = SHORT_RANGE_MOVES.gold;
    for (const dir of dirs) {
      const [dr, dc] = flipDirection(dir, owner);
      const nr = row + dr;
      const nc = col + dc;
      if (isInBoard(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.owner !== owner) {
          moves.push({ row: nr, col: nc });
        }
      }
    }
    return moves;
  }

  // 短距離駒（玉、金、銀、歩）
  if (SHORT_RANGE_MOVES[type]) {
    const dirs = SHORT_RANGE_MOVES[type];
    for (const dir of dirs) {
      const [dr, dc] = flipDirection(dir, owner);
      const nr = row + dr;
      const nc = col + dc;
      if (isInBoard(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.owner !== owner) {
          moves.push({ row: nr, col: nc });
        }
      }
    }
  }

  // 長距離駒（角、飛）
  if (LONG_RANGE_MOVES[type]) {
    const dirs = LONG_RANGE_MOVES[type];
    for (const dir of dirs) {
      const [dr, dc] = flipDirection(dir, owner);
      let nr = row + dr;
      let nc = col + dc;
      while (isInBoard(nr, nc)) {
        const target = board[nr][nc];
        if (target) {
          if (target.owner !== owner) {
            moves.push({ row: nr, col: nc });
          }
          break;
        }
        moves.push({ row: nr, col: nc });
        nr += dr;
        nc += dc;
      }
    }

    // 成り駒の追加移動（馬: +上下左右、龍: +斜め）
    if (promoted && PROMOTED_EXTRA_MOVES[type]) {
      const extraDirs = PROMOTED_EXTRA_MOVES[type];
      for (const dir of extraDirs) {
        const [dr, dc] = flipDirection(dir, owner);
        const nr = row + dr;
        const nc = col + dc;
        if (isInBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target || target.owner !== owner) {
            moves.push({ row: nr, col: nc });
          }
        }
      }
    }
  }

  return moves;
}

/**
 * 指定マスが指定プレイヤーの駒に攻撃されているかチェック
 */
export function isSquareAttackedBy(board, targetRow, targetCol, attacker) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.owner === attacker) {
        const moves = getRawMoves(board, r, c);
        if (moves.some(m => m.row === targetRow && m.col === targetCol)) {
          return true;
        }
      }
    }
  }
  return false;
}
