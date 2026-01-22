/**
 * Input Component
 * Campo de entrada reutilizable
 */

import './Input.css'

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    helperText,
    icon = null,
    iconPosition = 'left',
    disabled = false,
    required = false,
    fullWidth = true,
    className = '',
    id,
    name,
    ...props
}) => {
    const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`

    const wrapperClasses = [
        'input-wrapper',
        fullWidth && 'input-wrapper--full',
        error && 'input-wrapper--error',
        disabled && 'input-wrapper--disabled',
        icon && `input-wrapper--icon-${iconPosition}`,
        className
    ].filter(Boolean).join(' ')

    return (
        <div className={wrapperClasses}>
            {label && (
                <label htmlFor={inputId} className="input__label">
                    {label}
                    {required && <span className="input__required">*</span>}
                </label>
            )}

            <div className="input__container">
                {icon && iconPosition === 'left' && (
                    <span className="input__icon input__icon--left">{icon}</span>
                )}

                <input
                    id={inputId}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className="input__field"
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={error || helperText ? `${inputId}-helper` : undefined}
                    {...props}
                />

                {icon && iconPosition === 'right' && (
                    <span className="input__icon input__icon--right">{icon}</span>
                )}
            </div>

            {(error || helperText) && (
                <p id={`${inputId}-helper`} className={`input__helper ${error ? 'input__helper--error' : ''}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    )
}

export default Input
