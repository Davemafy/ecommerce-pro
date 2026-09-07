export function FormFields({ fields, values = {}, onChange, errors = {} }) {
  return (
    <div className="modal-form">
      {fields.map(({ name, label, type = 'text', placeholder = '', required = false }) => (
        <label key={name}>
          {label}
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={values[name] ?? ''}
            required={required}
            onChange={(event) => onChange?.(name, event.target.value)}
            aria-invalid={Boolean(errors[name])}
          />
          {errors[name] && <small className="field-error">{errors[name]}</small>}
        </label>
      ))}
    </div>
  );
}
