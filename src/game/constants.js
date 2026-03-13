// 駒の種類
export const PIECE_TYPES = {
  KING: 'king',
  GOLD: 'gold',
  SILVER: 'silver',
  BISHOP: 'bishop',
  ROOK: 'rook',
  PAWN: 'pawn',
};

// プレイヤー
export const PLAYERS = {
  SENTE: 'sente',
  GOTE: 'gote',
};

// ゲームステータス
export const GAME_STATUS = {
  PLAYING: 'playing',
  SENTE_WIN: 'sente_win',
  GOTE_WIN: 'gote_win',
  DRAW: 'draw',
};

// 盤面サイズ
export const BOARD_SIZE = 5;

// 駒の表示名（通常）
export const PIECE_NAMES = {
  king: '玉',
  gold: '金',
  silver: '銀',
  bishop: '角',
  rook: '飛',
  pawn: '歩',
};

// 駒の表示名（成り駒）
export const PROMOTED_PIECE_NAMES = {
  silver: '全',
  bishop: '馬',
  rook: '龍',
  pawn: 'と',
};

// 成れる駒（金・玉は成れない）
export const CAN_PROMOTE = {
  king: false,
  gold: false,
  silver: true,
  bishop: true,
  rook: true,
  pawn: true,
};

// 駒の価値（AI評価用）
export const PIECE_VALUES = {
  king: 10000,
  rook: 10,
  bishop: 8,
  gold: 6,
  silver: 5,
  pawn: 1,
};

// 成り駒のボーナス価値
export const PROMOTED_BONUS = {
  silver: 3,  // 5 → 8
  bishop: 4,  // 8 → 12
  rook: 5,    // 10 → 15
  pawn: 5,    // 1 → 6
};

// 初期盤面
// board[row][col] - row: 0=一段目(上), col: 0=5筋(左)
export function createInitialBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );

  // 後手（上側・一段目）: 飛 角 銀 金 玉
  board[0][0] = { type: 'rook', owner: 'gote', promoted: false };
  board[0][1] = { type: 'bishop', owner: 'gote', promoted: false };
  board[0][2] = { type: 'silver', owner: 'gote', promoted: false };
  board[0][3] = { type: 'gold', owner: 'gote', promoted: false };
  board[0][4] = { type: 'king', owner: 'gote', promoted: false };

  // 後手の歩（二段目・1筋）
  board[1][4] = { type: 'pawn', owner: 'gote', promoted: false };

  // 先手の歩（四段目・5筋）
  board[3][0] = { type: 'pawn', owner: 'sente', promoted: false };

  // 先手（下側・五段目）: 玉 金 銀 角 飛
  board[4][0] = { type: 'king', owner: 'sente', promoted: false };
  board[4][1] = { type: 'gold', owner: 'sente', promoted: false };
  board[4][2] = { type: 'silver', owner: 'sente', promoted: false };
  board[4][3] = { type: 'bishop', owner: 'sente', promoted: false };
  board[4][4] = { type: 'rook', owner: 'sente', promoted: false };

  return board;
}

// 初期持ち駒
export function createInitialHands() {
  return {
    sente: { gold: 0, silver: 0, bishop: 0, rook: 0, pawn: 0 },
    gote: { gold: 0, silver: 0, bishop: 0, rook: 0, pawn: 0 },
  };
}

// 持ち駒の表示順
export const HAND_PIECE_ORDER = ['rook', 'bishop', 'gold', 'silver', 'pawn'];
