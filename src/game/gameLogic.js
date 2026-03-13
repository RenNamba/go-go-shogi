import { BOARD_SIZE, CAN_PROMOTE } from './constants.js';
import { getRawMoves, isSquareAttackedBy, isInBoard } from './pieces.js';

// --- ユーティリティ ---

/**
 * 盤面をディープコピーする
 */
export function cloneBoard(board) {
  return board.map(row =>
    row.map(cell => (cell ? { ...cell } : null))
  );
}

/**
 * 持ち駒をディープコピーする
 */
export function cloneHands(hands) {
  return {
    sente: { ...hands.sente },
    gote: { ...hands.gote },
  };
}

/**
 * 指定プレイヤーの玉の位置を返す
 */
export function findKing(board, player) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'king' && piece.owner === player) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

// --- 王手判定 ---

/**
 * 指定プレイヤーの玉が王手されているか
 */
export function isInCheck(board, player) {
  const kingPos = findKing(board, player);
  if (!kingPos) return false;
  const opponent = player === 'sente' ? 'gote' : 'sente';
  return isSquareAttackedBy(board, kingPos.row, kingPos.col, opponent);
}

// --- 成り判定 ---

/**
 * 成れるかどうか判定
 * 敵陣: 先手の敵陣 = 0段目, 後手の敵陣 = 4段目
 */
export function canPromote(piece, fromRow, toRow) {
  if (!CAN_PROMOTE[piece.type]) return false;
  if (piece.promoted) return false;

  const enemyZone = piece.owner === 'sente' ? 0 : BOARD_SIZE - 1;
  return fromRow === enemyZone || toRow === enemyZone;
}

/**
 * 強制成り判定（行き所のない駒）
 * 歩が最終段に到達した場合
 */
export function mustPromote(piece, toRow) {
  if (piece.type === 'pawn') {
    const lastRow = piece.owner === 'sente' ? 0 : BOARD_SIZE - 1;
    return toRow === lastRow;
  }
  return false;
}

// --- 合法手生成 ---

/**
 * 盤上の駒を動かした後、自玉が王手にならないかチェック
 */
function isMoveLegal(board, fromRow, fromCol, toRow, toCol, player) {
  const newBoard = cloneBoard(board);
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;
  return !isInCheck(newBoard, player);
}

/**
 * 盤上の駒の合法移動先を取得
 */
export function getLegalMovesForPiece(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const rawMoves = getRawMoves(board, row, col);
  return rawMoves.filter(m =>
    isMoveLegal(board, row, col, m.row, m.col, piece.owner)
  );
}

/**
 * 持ち駒の打ち込み可能マスを取得
 */
export function getLegalDropSquares(board, hands, player, pieceType) {
  if (hands[player][pieceType] <= 0) return [];

  const squares = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) continue;

      // 歩の制約チェック
      if (pieceType === 'pawn') {
        // 行き所のない場所に打てない（最終段）
        const lastRow = player === 'sente' ? 0 : BOARD_SIZE - 1;
        if (r === lastRow) continue;

        // 二歩チェック
        if (hasDoublePawn(board, player, c)) continue;

        // 打ち歩詰めチェック
        if (isDropPawnMate(board, hands, player, r, c)) continue;
      }

      // 打った後に自玉が王手にならないか（通常、打ちで自玉が危険になることはないが念のため）
      const newBoard = cloneBoard(board);
      newBoard[r][c] = { type: pieceType, owner: player, promoted: false };
      if (!isInCheck(newBoard, player)) {
        squares.push({ row: r, col: c });
      }
    }
  }

  return squares;
}

/**
 * 二歩チェック: 指定筋に指定プレイヤーの歩（成っていない）があるか
 */
function hasDoublePawn(board, player, col) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    const piece = board[r][col];
    if (piece && piece.type === 'pawn' && piece.owner === player && !piece.promoted) {
      return true;
    }
  }
  return false;
}

/**
 * 打ち歩詰めチェック: 歩を打って相手が詰みになるか
 */
function isDropPawnMate(board, hands, player, dropRow, dropCol) {
  const opponent = player === 'sente' ? 'gote' : 'sente';

  // 歩を打った盤面を作成
  const newBoard = cloneBoard(board);
  newBoard[dropRow][dropCol] = { type: 'pawn', owner: player, promoted: false };

  // 相手が王手されていなければ打ち歩詰めではない
  if (!isInCheck(newBoard, opponent)) return false;

  // 相手に合法手があるか確認
  return !hasAnyLegalMove(newBoard, hands, opponent);
}

/**
 * 指定プレイヤーに合法手があるか（1つでもあれば true）
 */
function hasAnyLegalMove(board, hands, player) {
  // 盤上の駒の移動
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.owner === player) {
        const moves = getLegalMovesForPiece(board, r, c);
        if (moves.length > 0) return true;
      }
    }
  }

  // 持ち駒の打ち込み
  for (const pieceType of Object.keys(hands[player])) {
    if (hands[player][pieceType] > 0) {
      const drops = getLegalDropSquares(board, hands, player, pieceType);
      if (drops.length > 0) return true;
    }
  }

  return false;
}

// --- 詰み判定 ---

/**
 * 指定プレイヤーが詰んでいるか
 */
export function isCheckmate(board, hands, player) {
  if (!isInCheck(board, player)) return false;
  return !hasAnyLegalMove(board, hands, player);
}

// --- 千日手判定 ---

/**
 * 局面のハッシュ文字列を生成
 * 盤面 + 持ち駒 + 手番 を含む
 */
export function generatePositionHash(board, hands, currentPlayer) {
  const boardStr = board.map(row =>
    row.map(cell => {
      if (!cell) return '---';
      return `${cell.owner[0]}${cell.type[0]}${cell.promoted ? 'p' : 'n'}`;
    }).join(',')
  ).join('/');

  const handsStr = ['sente', 'gote'].map(p =>
    Object.entries(hands[p]).map(([t, n]) => `${t[0]}${n}`).join('')
  ).join('|');

  return `${boardStr}:${handsStr}:${currentPlayer}`;
}

/**
 * 千日手チェック: 同一局面が指定回数出現したか
 */
export function checkRepetition(positionHistory, currentHash, threshold = 4) {
  const count = positionHistory.filter(h => h === currentHash).length;
  return count >= threshold;
}

// --- 駒の移動実行 ---

/**
 * 盤上の駒を移動する（成りの処理は呼び出し側で行う）
 * @returns {{ newBoard, newHands, captured }} 移動後の盤面、持ち駒、取った駒
 */
export function movePiece(board, hands, fromRow, fromCol, toRow, toCol) {
  const newBoard = cloneBoard(board);
  const newHands = cloneHands(hands);
  const movingPiece = newBoard[fromRow][fromCol];
  const captured = newBoard[toRow][toCol];

  // 駒を取った場合、持ち駒に追加（成り駒は元に戻す）
  if (captured) {
    const capturedType = captured.type;
    newHands[movingPiece.owner][capturedType] += 1;
  }

  // 駒を移動
  newBoard[toRow][toCol] = movingPiece;
  newBoard[fromRow][fromCol] = null;

  return { newBoard, newHands, captured };
}

/**
 * 駒を成らせる
 */
export function promotePiece(board, row, col) {
  const newBoard = cloneBoard(board);
  if (newBoard[row][col]) {
    newBoard[row][col] = { ...newBoard[row][col], promoted: true };
  }
  return newBoard;
}

/**
 * 持ち駒を盤面に打つ
 * @returns {{ newBoard, newHands }}
 */
export function dropPiece(board, hands, player, pieceType, toRow, toCol) {
  const newBoard = cloneBoard(board);
  const newHands = cloneHands(hands);

  newBoard[toRow][toCol] = { type: pieceType, owner: player, promoted: false };
  newHands[player][pieceType] -= 1;

  return { newBoard, newHands };
}

// --- 全合法手リスト（AI用） ---

/**
 * 指定プレイヤーの全合法手をリストアップ
 * @returns {Array<{type: 'move'|'drop', from?, to, pieceType?, promote?}>}
 */
export function getAllLegalMoves(board, hands, player) {
  const allMoves = [];

  // 盤上の駒の移動
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.owner === player) {
        const moves = getLegalMovesForPiece(board, r, c);
        for (const m of moves) {
          const cp = canPromote(piece, r, m.row);
          const mp = mustPromote(piece, m.row);

          if (mp) {
            // 強制成り
            allMoves.push({ type: 'move', from: { row: r, col: c }, to: m, promote: true });
          } else if (cp) {
            // 成れる場合、成る/成らないの両方を追加
            allMoves.push({ type: 'move', from: { row: r, col: c }, to: m, promote: true });
            allMoves.push({ type: 'move', from: { row: r, col: c }, to: m, promote: false });
          } else {
            allMoves.push({ type: 'move', from: { row: r, col: c }, to: m, promote: false });
          }
        }
      }
    }
  }

  // 持ち駒の打ち込み
  for (const pieceType of Object.keys(hands[player])) {
    if (hands[player][pieceType] > 0) {
      const drops = getLegalDropSquares(board, hands, player, pieceType);
      for (const sq of drops) {
        allMoves.push({ type: 'drop', pieceType, to: sq });
      }
    }
  }

  return allMoves;
}
