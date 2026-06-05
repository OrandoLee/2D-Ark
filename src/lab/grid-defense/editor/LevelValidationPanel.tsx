import type { ValidationResult } from '../../../types/level'

interface LevelValidationPanelProps {
  validation: ValidationResult
}

export function LevelValidationPanel({ validation }: LevelValidationPanelProps) {
  return (
    <section className="editor-panel validation-panel">
      <div className="editor-panel-heading">
        <span>合法性检查</span>
        <strong className={validation.valid ? 'ok' : 'bad'}>{validation.valid ? '通过' : '阻止试玩'}</strong>
      </div>
      <div className="validation-columns">
        <div>
          <h3>错误</h3>
          {validation.errors.length === 0 ? (
            <p className="empty-note">没有阻塞错误。</p>
          ) : (
            validation.errors.map((item) => <p key={item.id}>{item.message}</p>)
          )}
        </div>
        <div>
          <h3>警告</h3>
          {validation.warnings.length === 0 ? (
            <p className="empty-note">没有警告。</p>
          ) : (
            validation.warnings.map((item) => <p key={item.id}>{item.message}</p>)
          )}
        </div>
      </div>
    </section>
  )
}
