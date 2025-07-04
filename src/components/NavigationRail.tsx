import React from 'react'
import './NavigationRail.css'

export interface NavigationStep {
  id: string
  label: string
  icon: string
  completed: boolean
  current: boolean
  disabled?: boolean
}

interface NavigationRailProps {
  steps: NavigationStep[]
  onStepClick: (stepId: string) => void
  className?: string
}

const NavigationRail: React.FC<NavigationRailProps> = ({
  steps,
  onStepClick,
  className = ''
}) => {
  return (
    <nav className={`navigation-rail ${className}`} role="navigation">
      <div className="rail-header">
        <h1 className="rail-title">📝 HybridNotes</h1>
        <p className="rail-subtitle">Paper is not obsolete.</p>
      </div>
      
      <ul className="rail-steps" role="list">
        {steps.map((step, index) => (
          <li key={step.id} className="step-item" role="listitem">
            <button
              className={`step-button ${step.current ? 'current' : ''} ${step.completed ? 'completed' : ''} ${step.disabled ? 'disabled' : ''}`}
              onClick={() => !step.disabled && onStepClick(step.id)}
              disabled={step.disabled}
              aria-current={step.current ? 'step' : undefined}
              aria-label={`Step ${index + 1}: ${step.label}${step.completed ? ' (completed)' : ''}${step.current ? ' (current)' : ''}`}
            >
              <div className="step-icon">
                {step.completed ? '✓' : step.icon}
              </div>
              <span className="step-label">{step.label}</span>
              <div className="step-indicator">
                {step.current && <div className="current-indicator" />}
              </div>
            </button>
            
            {index < steps.length - 1 && (
              <div className={`step-connector ${step.completed ? 'completed' : ''}`} />
            )}
          </li>
        ))}
      </ul>
      
      <div className="rail-footer">
        <div className="progress-info">
          <span className="progress-text">
            {steps.filter(s => s.completed).length} of {steps.length} completed
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavigationRail
