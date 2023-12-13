const TextArea = ({ type, placeholder, name, value, defaultValue, required, rows, cols, onChange, ...props }) => {
    return (
        <textarea
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder={placeholder}
            name={name}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            required={required}
            rows={rows}
            cols={cols}
            {...props}
        />
    );
};

export default TextArea;
