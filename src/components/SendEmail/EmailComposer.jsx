import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill's styles
import "../../assets/css/emailcomposer.css";

const EmailComposer = ({ onMessageChange }) => {
    const [editorHtml, setEditorHtml] = useState("");

    const modules = {
        toolbar: [
            [{ font: [] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
        ],
    };

    const formats = [
        "font",
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "align",
        "list",
        "script",
        "indent",
    ];

    const handleMessageChange = (message) => {
        setEditorHtml(message);
        onMessageChange(message);
    };

    return (
        <div>
            <ReactQuill
                theme="snow"
                value={editorHtml}
                onChange={handleMessageChange}
                modules={modules}
                formats={formats}
                className="custom-quill-editor"
            />
        </div>
    );
};

export default EmailComposer;
