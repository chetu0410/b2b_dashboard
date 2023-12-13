import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../Button/Button";
import IconInput from "../Input/IconInput";

const SearchBox = () => {
    const [text, setText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!text.trim()) return toast.error("Please enter some keywords");

        const searchKeyWords = text.split(" ").join("+");
        window.open(`https://www.google.com/search?tbs=lf:1,lf_ui:2&tbm=lcl&q=${searchKeyWords}`);
    };

    return (
        <form onSubmit={handleSubmit}>
            <IconInput
                className="flex max-w-md w-full min-w-[70px]"
                placeholder="Find new leads"
                place="end"
                onChange={(e) => setText(e.target.value)}
            >
                <Button type="submit" variant="contained" color="primary" size="sm">
                    Go
                </Button>
            </IconInput>
        </form>
    );
};

export default SearchBox;
