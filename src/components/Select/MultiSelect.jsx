import classNames from "classnames";
import Select from "react-select";

const MultiSelect = ({ children, className, defaultValue, value, options, name, onChange, ...props }) => {
    return (
        <Select
            isMulti
            defaultValue={defaultValue}
            options={options}
            className={classNames(className)}
            classNamePrefix="mlti-select"
            name={name}
            value={value}
            onChange={onChange}
            {...props}
        />
    );
};

export default MultiSelect;
