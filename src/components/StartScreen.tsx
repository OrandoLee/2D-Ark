interface StartScreenProps {
  onStart: () => void
  onOpenEditor?: () => void
}

export function StartScreen({ onStart, onOpenEditor }: StartScreenProps) {
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
        </div>
        <div className="briefing">
          <span>行动指令</span>
          <p>部署作战模块，抵御敌人波次，保持核心完整。</p>
        </div>
        <div className="start-actions">
          <button className="start-button" onClick={onStart}>
            <span>开始行动</span>
            <b>-&gt;</b>
          </button>
          {onOpenEditor && (
            <button className="start-button start-button-secondary" onClick={onOpenEditor}>
              <span>关卡编辑器</span>
              <b>-&gt;</b>
            </button>
          )}
        </div>
        <div className="start-footer">
          <span>版本 / 01.26</span>
          <span>状态 / 就绪</span>
          <span>纯前端模拟运行</span>
        </div>
      </div>
    </main>
  )
}
