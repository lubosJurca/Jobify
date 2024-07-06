const FormRow = ({ type, name, labelText, defaultValue, onChange }) => {
  return (
    <div className='form-row'>
      <label htmlFor={name} className='form-label'>
        {labelText || name}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        defaultValue={defaultValue || ''}
        className='form-input'
        onChange={onChange}
        required
      />
    </div>
  );
};
export default FormRow;
