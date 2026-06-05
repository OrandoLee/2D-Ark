import type { ValidationResult } from '../../../types/level'

interface LevelValidationPanelProps {
  validation: ValidationResult
}

export function LevelValidationPanel({ validation }: LevelValidationPanelProps) {
  return (
    <section className="editor-panel validation-panel">
      <div className="editor-panel-heading">
        <span>Validation</span>
        <strong className={validation.valid ? 'ok' : 'bad'}>{validation.valid ? 'PASS' : 'BLOCKED'}</strong>
      </div>
      <div className="validation-columns">
        <div>
          <h3>Errors</h3>
          {validation.errors.length === 0 ? (
            <p className="empty-note">No blocking errors.</p>
          ) : (
            validation.errors.map((item) => <p key={item.id}>{item.message}</p>)
          )}
        </div>
        <div>
          <h3>Warnings</h3>
          {validation.warnings.length === 0 ? (
            <p className="empty-note">No warnings.</p>
          ) : (
            validation.warnings.map((item) => <p key={item.id}>{item.message}</p>)
          )}
        </div>
      </div>
    </section>
  )
}
