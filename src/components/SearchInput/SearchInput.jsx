import classNames from "classnames";

const SearchInput = ({ className, placeholder, value, defaultValue, name, onChange, ...props }) => {
    return (
        <div className="relative w-full max-w-[400px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none w-full">
                <svg
                    className="w-4 h-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                </svg>
            </div>

            <input
                type="search"
                className={classNames(
                    "block w-full px-4 py-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-full bg-gray-50 focus:ring-0 focus:outline-none",
                    className
                )}
                placeholder={placeholder}
                value={value}
                defaultValue={defaultValue}
                name={name}
                onChange={onChange}
                {...props}
            />
        </div>
    );
};

export default SearchInput;
