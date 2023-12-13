const ImageModal = ({ base64, show, setShow }) => {
    if (!show) return null;
    return (
        <div
            className="yog-image-modal
        w-full fixed top-0 left-0 flex justify-center items-center
        bg-black bg-opacity-50 z-50
        h-screen
        
    "
        >
            <div
                className="yog-image-modal-content
        bg-white    
        w-3/4
        h-3/4
        flex justify-center items-center
        rounded-lg
        shadow-lg
        relative
        "
            >
                <span
                    className="yog-image-modal-close
        absolute -top-8 -right-4
        text-white
        text-2xl
        cursor-pointer
        "
                    onClick={() => setShow(false)}
                >
                    &times;
                </span>
                <img className="w-full h-full object-contain" src={base64} alt="" />
            </div>
        </div>
    );
};

export default ImageModal;
