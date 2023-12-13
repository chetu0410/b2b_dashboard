import { useState, useEffect, useMemo } from "react";
import { getWhatsappTemplate, insertWhatsappTemplate, editWhatsappTemplate } from "../../apis";
import { FaCheck } from "react-icons/fa";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import toast from "react-hot-toast";

import Spinner from "../Spinner/Spinner";
import MessagePreview from "./MessagePreview";
import Button from "../Button/Button";

const TemplateModel = ({ user_uid, handleTemplateChange, message, show, isDisabled }) => {
    const [templateList, setTemplateList] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateName, setTemplateName] = useState("");
    const [templateMessage, setTemplateMessage] = useState("");

    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [fetching, setFetching] = useState(false);

    const handleNameChange = (e) => {
        setTemplateName(e.target.value);
    };

    const handleMessageChange = (e) => {
        setTemplateMessage(e.target.value);
    };

    const handleCreateTemplate = () => {
        if (templateList.length === 20) toast.error("Maximum template limit reached!");
        else {
            setTemplateName("");
            setTemplateMessage("");
            setIsCreating(true);
        }
    };

    const handleSelectTemplate = (index) => {
        setSelectedTemplate(templateList[index]);
        handleTemplateChange(templateList[index].template_text);
    };

    const handleEditTemplate = (index) => {
        setEditingTemplate(templateList[index]);
        setTemplateName(templateList[index].template_name);
        setTemplateMessage(templateList[index].template_text);
        setIsEditing(true);
    };

    const fetchTemplates = async () => {
        setTemplateList([]);
        setFetching(true);
        try {
            const { data: res } = await getWhatsappTemplate({
                user_uid: user_uid,
            });

            if (res.status !== "success") throw Error(res.data);
            else {
                setFetching(false);
                setTemplateList(res.data);
            }
        } catch (err) {
            setFetching(false);
            if (!err.message.includes("no list found with user_uid")) toast.error(err.message);
        }
    };

    const insertTemplate = async () => {
        const tId = toast.loading("Creating template...");
        setIsSending(true);
        try {
            const body = {
                user_uid: user_uid,
                template_name: templateName,
                template_text: templateMessage,
            };

            const { data: res } = await insertWhatsappTemplate(body);

            if (res.status !== "success") throw Error(res.data);
            else {
                toast.dismiss(tId);
                toast.success("Template created successfully!");
                setIsSending(false);
                setIsCreating(false);
                fetchTemplates();
            }
        } catch (err) {
            toast.dismiss(tId);
            toast.error(err.message);
            setIsSending(false);
        }
    };

    const editTemplate = async () => {
        const tId = toast.loading("Editing template...");
        setIsSending(true);
        try {
            const body = {
                user_uid: user_uid,
                template_uid: editingTemplate.template_uid,
                new_template_name: templateName,
                new_template_text: templateMessage,
            };

            const { data: res } = await editWhatsappTemplate(body);

            if (res.status !== "success") throw Error(res.data);
            else {
                toast.dismiss(tId);
                toast.success("Template edited successfully!");
                setIsSending(false);
                setIsEditing(false);
                fetchTemplates();

                if (selectedTemplate.template_uid === editingTemplate.template_uid)
                    handleTemplateChange(templateMessage);
            }
        } catch (err) {
            toast.dismiss(tId);
            toast.error(err.message);
            setIsSending(false);
        }
    };

    const handleClickCancel = () => {
        setIsCreating(false);
        setIsEditing(false);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const buttonDisabled = useMemo(() => {
        return !templateName || !templateMessage || isSending;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateName, templateMessage, isSending]);

    const inputDisabled = useMemo(() => {
        return isSending;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSending]);

    if (!show) return null;

    return (
        <div className="w-full px-4">
            {!isCreating && !isEditing && (
                <div className="flex items-center justify-between mb-2">
                    <div className="block font-bold text-sm">
                        Message Templates: {templateList.length !== 0 ? ` (${templateList.length}/20)` : ""}
                    </div>
                    <Button
                        variant="contained"
                        color="green"
                        size="xs"
                        onClick={handleCreateTemplate}
                        className="!px-2 !text-white"
                        disabled={isDisabled}
                    >
                        Create New
                    </Button>
                </div>
            )}
            {isCreating && !isEditing && (
                <div className="flex items-center justify-start mb-2">
                    <div className="block font-bold text-sm">Creating New Template:</div>
                </div>
            )}
            {!isCreating && isEditing && (
                <div className="flex items-center justify-start mb-2">
                    <div className="block font-bold text-sm">Editing Template:</div>
                </div>
            )}
            {!fetching && (
                <>
                    {!isCreating && !isEditing && (
                        <div className="max-h-[420px] flex flex-col w-full overflow-auto overscroll-contain">
                            {templateList.length !== 0 &&
                                templateList.map((template, i) => {
                                    return (
                                        <div key={i} className="mx-2 my-4">
                                            <p className="text-xs text-right font-medium mb-1">
                                                {template.template_name}
                                            </p>
                                            <MessagePreview markdownText={template.template_text} />
                                            <div className="flex items-center justify-end gap-4 mt-1">
                                                <Button
                                                    variant={
                                                        selectedTemplate &&
                                                        selectedTemplate.template_uid === template.template_uid &&
                                                        template.template_text === message
                                                            ? "contained"
                                                            : "outlined"
                                                    }
                                                    color="primary"
                                                    size="xs"
                                                    onClick={() => handleSelectTemplate(i)}
                                                    className="!px-2"
                                                    disabled={isDisabled}
                                                >
                                                    {selectedTemplate &&
                                                    selectedTemplate.template_uid === template.template_uid &&
                                                    template.template_text === message ? (
                                                        <FaCheck className="mx-2.5 my-0.5" />
                                                    ) : (
                                                        "Select"
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="outlined"
                                                    color="green"
                                                    size="xs"
                                                    onClick={() => handleEditTemplate(i)}
                                                    className="!px-2"
                                                    disabled={isDisabled}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                    {(isCreating || isEditing) && (
                        <>
                            <div className="mb-4">
                                <label htmlFor="templateName" className="block font-medium mb-1 text-sm">
                                    Template Name:
                                </label>
                                <input
                                    disabled={inputDisabled}
                                    type="text"
                                    id="templateName"
                                    value={templateName}
                                    onChange={handleNameChange}
                                    className="w-full text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="templateMessage" className="block font-medium mb-1 text-sm">
                                    Template Message:
                                </label>
                                <textarea
                                    disabled={inputDisabled}
                                    id="templateMessage"
                                    value={templateMessage}
                                    onChange={handleMessageChange}
                                    className="w-full text-sm px-4 py-2 border border-neutral-300 rounded-md resize-none focus:outline-none focus:border-blue-400"
                                    rows="4"
                                ></textarea>
                            </div>

                            <MessagePreview markdownText={templateMessage} />
                            <p className="text-xs text-right font-medium">{templateName}</p>

                            <div className="flex items-center justify-center gap-4 mt-2">
                                <Button
                                    className="h-12 w-12 rounded-full !font-bold !p-0"
                                    variant="contained"
                                    color="green"
                                    size="sm"
                                    onClick={isCreating ? insertTemplate : editTemplate}
                                    title="Confirm"
                                    disabled={buttonDisabled}
                                >
                                    <IoCheckmarkSharp size={30} color={"white"} />
                                </Button>

                                <Button
                                    className="h-12 w-12 rounded-full !font-bold !p-0"
                                    variant="contained"
                                    color="red"
                                    size="sm"
                                    onClick={handleClickCancel}
                                    title="Cancel"
                                >
                                    <IoCloseSharp size={30} color={"white"} />
                                </Button>
                            </div>
                        </>
                    )}
                </>
            )}
            {!fetching && templateList.length === 0 && !isCreating && (
                <div className="f-center mt-32">
                    <p className="text-sm text-center font-medium text-gray-500">
                        No message templates found.
                        <br /> <br /> Templates help you streamline your WhatsApp lead communication. Click the "Create
                        New" button to get started.
                    </p>
                </div>
            )}
            {fetching && (
                <div className="f-center">
                    <Spinner />
                </div>
            )}
        </div>
    );
};

export default TemplateModel;
