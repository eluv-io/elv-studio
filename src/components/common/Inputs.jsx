import {useEffect, useState} from "react";
import {ParseInputJson} from "@/utils/Input";
import {CircleInfoIcon as InfoIcon} from "@/assets/icons";
import Tooltip from "@/components/common/Tooltip";

export const Select = ({
  options,
  label,
  labelDescription,
  required,
  defaultOption={},
  formName,
  onChange,
  disabled,
  value,
  tooltip
}) => {
  return (
    <>
      <label className="form__input-label" htmlFor={formName}>
        <span>{ label }</span>
        {
          required &&
          <span className="form__input-label--required">*</span>
        }
        {
          tooltip ?
            <Tooltip
              className="form__input-label-tooltip"
              message={tooltip}
              Icon={InfoIcon}
              side="bottom"
              sideOffset={0}
              alignOffest={-12}
              align="start"
              maxWidth={"500px"}
            /> : null
        }
      </label>
      <div className="form__input-description">{ labelDescription }</div>
      <select
        required={required}
        name={formName}
        onChange={onChange}
        disabled={disabled}
        value={value}
      >
        {
          "label" in defaultOption && "value" in defaultOption ?
            <option value={defaultOption.value} title={defaultOption.title}>{defaultOption.label}</option> : null
        }
        {
          options.map(option => (
            <option
              value={option.value}
              key={option.value}
              disabled={option.disabled}
              title={option.title}
            >
              { option.label }
            </option>
          ))
        }
      </select>
    </>
  );
};

export const Input = ({
  label,
  labelDescription,
  required,
  value,
  formName,
  onChange,
  placeholder,
  type="text",
  disabled,
  hidden
}) => {
  return (
    <>
      <label className={`form__input-label${disabled ? " form__input-label--disabled" : ""}`} htmlFor={formName}>
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </label>
      <div className="form__input-description">{ labelDescription }</div>
      <input
        type={type}
        name={formName}
        required={required}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        hidden={hidden}
      />
    </>
  );
};

export const TextArea = ({
  label,
  required,
  formName,
  onChange,
  value,
  disabled
}) => {
  return (
    <>
      <label className={`form__input-label${disabled ? " form__input-label--disabled" : ""}`} htmlFor={formName}>
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </label>
      <textarea
        name={formName}
        required={required}
        onChange={onChange}
        value={value || ""}
        disabled={disabled}
      />
    </>
  );
};

export const JsonTextArea = ({
  formName,
  value,
  onChange,
  label,
  labelDescription,
  required,
  disabled,
  defaultValue
}) => {
  const [modifiedJSON, setModifiedJSON] = useState(value);
  const [error, setError] = useState();

  useEffect(() => {
    setModifiedJSON(value);
  }, [value]);

  const HandleChange = event => {
    try {
      const json = JSON.stringify(
        ParseInputJson(
          {metadata: modifiedJSON, defaultValue}
        ), null, 2);
      setModifiedJSON(json);

      event.target.value = json;

      setError(undefined);
    } catch(error) {
      setError(error.message);
    }

    onChange(event);
  };

  return (
    <>
      <label htmlFor={formName} className={`form__input-label${disabled ? " form__input-label--disabled" : ""}`}>
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </label>
      <div className={`form__input-description${disabled ? " form__input-description--disabled" : ""}`}>{ labelDescription }</div>
      <textarea
        name={formName}
        value={modifiedJSON || ""}
        title={error}
        aria-errormessage={error}
        onChange={event => setModifiedJSON(event.target.value)}
        onBlur={HandleChange}
        disabled={disabled}
        className={`form__json-field${error ? " form__json-field--invalid" : ""}`}
      />
    </>
  );
};

export const Checkbox = ({
  label,
  formName,
  value,
  checked,
  onChange,
  disabled
}) => {
  return (
    <div className="form__checkbox-container">
      <label htmlFor={formName} className={`form__input-label${disabled ? " form__input-label--disabled" : ""}`}>{ label }</label>
      <input
        name={formName}
        type="checkbox"
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export const Radio = ({label, formName, required, options=[]}) => {
  return (
    <div className="form__radio-container">
      <p className="form__input-label">
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </p>
      {
        options.map(({optionLabel, id, value, checked, onChange}) => (
          <div key={`radio-option-${id}`}>
            <input
              name={formName}
              id={id}
              type="radio"
              value={value}
              checked={checked}
              onChange={onChange}
            />
            <label htmlFor={id}>
              { optionLabel }
            </label>
          </div>
        ))
      }
    </div>
  );
};
