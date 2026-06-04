interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <main className="start-screen">
      <div className="start-grid" aria-hidden="true">
        {Array.from({ length: 96 }, (_, index) => (
          <span key={index} className={index % 13 === 0 || index % 17 === 0 ? 'lit' : ''} />
        ))}
      </div>
      <div className="start-content">
        <span className="start-index">实验编号 / 001</span>
        <div className="title-lockup">
          <span>DELEE LAB 呈现</span>
          <h1>
            GRID DEFENSE
            <b>LAB-01</b>
          </h1>
          <p>DELEE LAB 战术格子实验</p>
        </div>
        <div className="briefing">
          <span>行动指令</span>
          <p>部署作战模块，抵御五波敌人，保护核心完整。</p>
        </div>
        <button className="start-button" onClick={onStart}>
          <span>开始行动</span>
          <b>→</b>
        </button>
        <div className="start-footer">
          <span>版本 / 01.26</span>
          <span>状态 / 就绪</span>
          <span>纯前端独立运行</span>
        </div>
      </div>
    </main>
  )
}
