export default function Stepper({ steps, currentStep, onStepClick }) {
  return (
    <div className="stepper">
      {steps.map(step => (
        <div
          key={step.number}
          className={`step ${step.number === currentStep ? 'active' : ''} ${step.number < currentStep ? 'done' : ''}`}
          onClick={() => onStepClick(step.number)}
        >
          <span className="num">{step.number}</span>
          <span className="label">{step.icon} {step.label}</span>
        </div>
      ))}
    </div>
  )
}
