export function FormFields({ fields, values = {}, onChange, errors = {} }) {
  return (
    <div className="modal-form">
      {fields.map(({ name, label, type = 'text', placeholder = '', required = false, autoComplete }) => (
        <label key={name}>
          <span className="field-label">{label}{required && <em aria-hidden="true">*</em>}</span>
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={values[name] ?? ''}
            required={required}
            autoComplete={autoComplete}
            onChange={(event) => onChange?.(name, event.target.value)}
            aria-invalid={Boolean(errors[name])}
          />
          {errors[name] && <small className="field-error">{errors[name]}</small>}
        </label>
      ))}
    </div>
  );
}
