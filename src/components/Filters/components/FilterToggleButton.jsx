import ToggleButton from "../../ToggleButton/ToggleButton";

const FilterToggleButton = ({ name, label, checked, checkedBox, onChange, onCheck }) => {
    return (
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1">
                {/* <CheckBox name={name} checked={checkedBox} size="md" onChange={onCheck} /> */}
                <p className="text-base text-gray-900 font-medium">{label}</p>
            </div>
            <ToggleButton name={name} checked={checked} onChange={onChange} />
        </div>
    );
};

export default FilterToggleButton;
