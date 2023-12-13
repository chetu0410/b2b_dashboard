import { useState, useEffect, useMemo } from "react";
import { getContactList, createContactList, updateContactList } from "../../apis";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import WhatsAppIcon from "../Icons/WhatsAppIcon";
import toast from "react-hot-toast";

import Spinner from "../Spinner/Spinner";
import Button from "../Button/Button";

const ContactModel = ({ user_uid, handleContactChange, show, isDisabled }) => {
    const [contactList, setContactList] = useState([]);
    const [contactId, setContactId] = useState(null);

    const [contactNumbers, setContactNumbers] = useState("");

    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [fetching, setFetching] = useState(false);

    const handleContactNumbersChange = (e) => {
        setContactNumbers(e.target.value);
    };

    const handleCreateContactList = () => {
        setContactNumbers("");
        setIsCreating(true);
    };

    const handleUpdateContactList = () => {
        setContactNumbers("");
        setIsUpdating(true);
    };

    const fetchContacts = async () => {
        setContactList([]);
        setContactId(null);
        setFetching(true);
        try {
            const { data: res } = await getContactList({
                user_uid: user_uid,
            });

            if (res.status !== "Success") throw Error(res.message);
            else if (res.message.includes("No result found for given user_uid")) throw Error(res.message);
            else {
                setContactList(res.team_data[0]?.phone_numbers);
                setContactId(res.team_data[0]?.team_contact_id);
                setFetching(false);
            }
        } catch (err) {
            setFetching(false);
            if (!err.message.includes("No result found for given user_uid")) toast.error(err.message);
        }
    };

    const createContacts = async () => {
        const tId = toast.loading("Creating contact list...");
        setIsSending(true);
        try {
            const body = {
                user_uid: user_uid,
                phone_numbers: contactNumbers,
            };

            const { data: res } = await createContactList(body);

            if (res.status !== "success") throw Error(res.data);
            else {
                toast.dismiss(tId);
                toast.success("Contact list created successfully!");
                setIsSending(false);
                setIsCreating(false);
                fetchContacts();
                handleContactChange();
            }
        } catch (err) {
            toast.dismiss(tId);
            toast.error(err.message);
            setIsSending(false);
        }
    };

    const updateContacts = async () => {
        const tId = toast.loading("Updating contact list...");
        setIsSending(true);
        try {
            const body = {
                team_contact_id: contactId,
                new_phone_number: contactNumbers,
            };

            const { data: res } = await updateContactList(body);

            if (res.status !== "success") throw Error(res.data);
            else {
                toast.dismiss(tId);
                toast.success("Contact list updated successfully!");
                setIsSending(false);
                setIsUpdating(false);
                fetchContacts();
                handleContactChange();
            }
        } catch (err) {
            toast.dismiss(tId);
            toast.error(err.message);
            setIsSending(false);
        }
    };

    const handleClickCancel = () => {
        setIsCreating(false);
        setIsUpdating(false);
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const buttonDisabled = useMemo(() => {
        return !contactNumbers || isSending;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactNumbers, isSending]);

    const inputDisabled = useMemo(() => {
        return isSending;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSending]);

    if (!show) return null;

    return (
        <div className="w-full px-4">
            {!isCreating && !isUpdating && (
                <div className="flex items-center justify-between mb-2">
                    <div className="block font-bold text-sm">Team Contact List: {`(${contactList.length})`}</div>
                    {contactList.length !== 0 && (
                        <Button
                            variant="contained"
                            color="blue"
                            size="xs"
                            onClick={handleUpdateContactList}
                            className="!px-2 !text-white"
                            disabled={isDisabled}
                        >
                            Add Contacts
                        </Button>
                    )}
                </div>
            )}
            {isCreating && !isUpdating && (
                <div className="flex items-center justify-start mb-2">
                    <div className="block font-bold text-sm">Creating New Contact List:</div>
                </div>
            )}
            {!isCreating && isUpdating && (
                <div className="flex items-center justify-start mb-2">
                    <div className="block font-bold text-sm">Updating Contact List:</div>
                </div>
            )}
            {!fetching && (
                <>
                    {!isCreating && (
                        <div className="max-h-[430px] grid grid-cols-2 w-full overflow-auto overscroll-contain">
                            {contactList.length !== 0 &&
                                contactList.map((number, i) => {
                                    return (
                                        <div key={i} className="mx-2 my-2">
                                            <div className="flex items-center gap-2">
                                                <WhatsAppIcon />
                                                <p className="text-md font-medium">{number}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                    {(isCreating || isUpdating) && (
                        <>
                            <div className="mt-2 mb-4">
                                <label htmlFor="contacts" className="block font-medium mb-1 text-sm">
                                    Phone Numbers:
                                </label>
                                <input
                                    disabled={inputDisabled}
                                    type="text"
                                    id="contacts"
                                    value={contactNumbers}
                                    onChange={handleContactNumbersChange}
                                    className="w-full text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                />
                                <p className="text-xs text-gray-500">
                                    Please add commas for multiple numbers.
                                    <br /> for e.g. 918882908807, 917864319548
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-4 mt-2">
                                <Button
                                    className="h-12 w-12 rounded-full !font-bold !p-0"
                                    variant="contained"
                                    color="green"
                                    size="sm"
                                    onClick={isCreating ? createContacts : updateContacts}
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
            {!fetching && contactList.length === 0 && !isCreating && (
                <div className="f-center flex flex-col mt-32 gap-4">
                    <p className="text-sm text-center font-medium text-gray-500">
                        No team contacts found.
                        <br />
                        <br /> Using numbers in known contact lists help you improve reputation of your WhatsApp number.
                    </p>
                    <Button
                        variant="contained"
                        color="green"
                        size="xs"
                        onClick={handleCreateContactList}
                        className="!px-2 !text-white"
                        disabled={isDisabled}
                    >
                        Create Contact List
                    </Button>
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

export default ContactModel;
