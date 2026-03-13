import './RulesModal.css';

export default function RulesModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rules-modal" onClick={e => e.stopPropagation()}>
        <h2 className="rules-title">遊び方</h2>
        <div className="rules-content">
          <section>
            <h3>基本ルール</h3>
            <p>5×5マスの将棋盤で対局します。先に相手の玉を詰んだ方が勝ちです。</p>
          </section>

          <section>
            <h3>駒の動き方</h3>
            <dl className="rules-pieces">
              <dt>玉（王）</dt>
              <dd>全方向に1マス移動できます</dd>
              <dt>金</dt>
              <dd>前・斜め前・横・後ろに1マス（斜め後ろには動けません）</dd>
              <dt>銀</dt>
              <dd>前・斜め前・斜め後ろに1マス（横・後ろには動けません）</dd>
              <dt>飛車</dt>
              <dd>縦横方向に何マスでも移動可能</dd>
              <dt>角行</dt>
              <dd>斜め方向に何マスでも移動可能</dd>
              <dt>歩</dt>
              <dd>前に1マスのみ</dd>
            </dl>
          </section>

          <section>
            <h3>成り</h3>
            <p>敵陣（相手側の1段目）に駒が入る・出る・中で動くとき、駒を成ることができます。</p>
            <ul>
              <li>銀 → 全（金と同じ動き）</li>
              <li>角 → 馬（角の動き＋上下左右1マス）</li>
              <li>飛 → 龍（飛の動き＋斜め1マス）</li>
              <li>歩 → と（金と同じ動き）</li>
            </ul>
            <p>※ 金と玉は成れません</p>
            <p>※ 歩が最終段に進んだ場合は必ず成ります</p>
          </section>

          <section>
            <h3>持ち駒</h3>
            <p>相手の駒を取ると持ち駒になり、自分の番に空いているマスに打てます。成り駒を取った場合は元の駒に戻ります。</p>
          </section>

          <section>
            <h3>禁止手</h3>
            <ul>
              <li><strong>二歩:</strong> 同じ筋に自分の歩を2枚置けません</li>
              <li><strong>打ち歩詰め:</strong> 歩を打って相手を詰ませることはできません</li>
              <li>行き所のない場所（最終段）に歩を打てません</li>
            </ul>
          </section>

          <section>
            <h3>千日手</h3>
            <p>同じ局面が4回出現した場合、ルール設定に応じて後手の勝ちまたは引き分けとなります。</p>
          </section>
        </div>

        <button className="modal-btn rules-close-btn" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}
