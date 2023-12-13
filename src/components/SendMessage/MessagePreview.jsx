import { useRef, useEffect, React } from "react";
import "../../assets/css/messagepreview.css";

const WhatsappMarkdownParser = ({ source }) => {
    // Define regular expressions to match Markdown patterns
    const strongRegex = /\*([^*]+)\*/g;
    const emphasisRegex = /_([^_]+)_/g;
    const strikethroughRegex = /~([^~]+)~/g;
    const codeBlockRegex = /```([^`]+)```/g;
    const urlRegex = /(https:\/\/)?[^\s]+\.[^\s]{2,3}/g;
    const lineBreakRegex = /\n/g;

    // Replace Markdown patterns with corresponding HTML tags
    let parsedText = source
        .replace(strongRegex, "<strong>$1</strong>")
        .replace(emphasisRegex, "<em>$1</em>")
        .replace(strikethroughRegex, "<del>$1</del>")
        .replace(codeBlockRegex, "<code>$1</code>")
        .replace(urlRegex, '<a href="$&" style="color: blue;" target="_blank">$&</a>')
        .replace(lineBreakRegex, "<br/>");

    return <div dangerouslySetInnerHTML={{ __html: parsedText }} />;
};

const MessagePreview = ({ markdownText }) => {
    const messageBoxRef = useRef(null);

    useEffect(() => {
        // Scroll to the bottom of the message box when content changes
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
    }, [markdownText]);

    if (!markdownText.trim()) {
        return null;
    }

    return (
        <div className="message-container">
            <div className="message-box" ref={messageBoxRef}>
                <WhatsappMarkdownParser source={markdownText} />
            </div>
        </div>
    );
};

export default MessagePreview;
