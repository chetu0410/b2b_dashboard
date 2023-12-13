import React, { useState } from "react";
import { BsCalendarMinus, BsClock } from "react-icons/bs";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { Link } from "react-router-dom";

import { AddIcon, Button, DeleteIcon, EditIcon, Input, TextArea, WhatsAppIcon2 } from "../../../components";

const initData = { show: false, id: "", name: "", message: "", date: "", time: "" };

const CreateAutomation = () => {
    const [data, setData] = useState([]);
    const [form, setForm] = useState({ ...initData });
    const [updateData, setUpdateData] = useState({});

    const handleChangeForm = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleClickToggleForm = (status) => {
        setForm({ ...form, show: status });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        form.id = Date.now();

        setData([...data, form]);
        setForm({ ...form, show: false });
    };

    const habdleClickDelete = (index) => {
        if (isNaN(index) || index < 0) return;

        data.splice(index, 1);
        setData([...data]);
    };

    const handleClickSetForUpdate = (data) => {
        setUpdateData(data);
    };

    const handleClickRemoveForUpdate = (data) => {
        setUpdateData({});
    };

    const handleChangeUpdateForm = (e) => {
        const { name, value } = e.target;
        setUpdateData({ ...updateData, [name]: value });
    };

    const handleClickUpdate = (e) => {
        e.preventDefault();

        setData(data.map((ele) => (ele.id === updateData.id ? updateData : ele)));

        setUpdateData({});
    };

    return (
        <div className="create_automation_page page">
            <section className="navigation">
                <Link to="/dev/admin/automation">
                    <div className="flex items-center gap-2">
                        <MdOutlineKeyboardArrowLeft className="text-2xl text-gray-600" />

                        <p className="font-medium">Restaurant Leads Chat Whats app automation</p>
                    </div>
                </Link>
            </section>

            <section className="automation_creator">
                <div className="f-center mt-20">
                    <WhatsAppIcon2 width={70} height={70} />
                </div>

                <div className="relative f-center flex-col z-10">
                    <div className="tracker_line absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-full -mt-1 bg-gray-300 z-0"></div>

                    {data.map((details, i) => (
                        <React.Fragment key={i}>
                            {updateData.id !== details.id && (
                                <div className="list_item max-w-lg w-full bg-white p-4 rounded-md border-2 border-primary z-10 mt-6">
                                    <div className="name flex items-center justify-between w-full mb-1">
                                        <h5 className="text-lg font-medium w-full">{details.name || "-"}</h5>
                                        <div className="flex items-center gap-4 min-w-[60px]">
                                            <div
                                                className="cursor-pointer"
                                                onClick={(e) => handleClickSetForUpdate(details)}
                                            >
                                                <EditIcon />
                                            </div>

                                            <div className="cursor-pointer" onClick={(e) => habdleClickDelete(i)}>
                                                <DeleteIcon />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="message w-full overflow-hidden whitespace-nowrap text-ellipsis font-normal mb-3">
                                        {details.message || "-"}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <BsCalendarMinus />
                                            {details.date || "-"}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <BsClock />
                                            {details.time || "-"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {updateData.id === details.id && (
                                <form
                                    onSubmit={handleClickUpdate}
                                    className="max-w-lg w-full bg-white border-2 border-primary rounded-lg p-4 mt-10 z-10"
                                >
                                    <div className="flex mb-5">
                                        <div className="w-1/3">
                                            <p className="mt-2">Name</p>
                                        </div>

                                        <div className="w-2/3">
                                            <Input
                                                placeholder="Enter Name"
                                                name="name"
                                                value={updateData.name}
                                                onChange={handleChangeUpdateForm}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex mb-5">
                                        <div className="w-1/3">
                                            <p className="mt-2">Whatsapp Messaage</p>
                                        </div>

                                        <div className="w-2/3">
                                            <TextArea
                                                placeholder="Write"
                                                rows={3}
                                                name="message"
                                                value={updateData.message}
                                                onChange={handleChangeUpdateForm}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex mb-5">
                                        <div className="w-1/3">
                                            <p className="mt-2">Schedule</p>
                                        </div>

                                        <div className="w-2/3 flex items-center gap-3">
                                            <Input
                                                type="date"
                                                name="date"
                                                value={updateData.date}
                                                onChange={handleChangeUpdateForm}
                                            />

                                            <Input
                                                type="time"
                                                name="time"
                                                value={updateData.time}
                                                onChange={handleChangeUpdateForm}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="contained"
                                                color="gray"
                                                onClick={handleClickRemoveForUpdate}
                                            >
                                                Cancel
                                            </Button>

                                            <Button type="submit" variant="contained" color="blue">
                                                Save Automation
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </React.Fragment>
                    ))}

                    {form.show && (
                        <form
                            onSubmit={handleSubmit}
                            className="max-w-lg w-full bg-white border-2 border-primary rounded-lg p-4 mt-10 z-10"
                        >
                            <div className="flex mb-5">
                                <div className="w-1/3">
                                    <p className="mt-2">Name</p>
                                </div>

                                <div className="w-2/3">
                                    <Input placeholder="Enter Name" name="name" onChange={handleChangeForm} />
                                </div>
                            </div>

                            <div className="flex mb-5">
                                <div className="w-1/3">
                                    <p className="mt-2">Whatsapp Messaage</p>
                                </div>

                                <div className="w-2/3">
                                    <TextArea placeholder="Write" rows={3} name="message" onChange={handleChangeForm} />
                                </div>
                            </div>

                            <div className="flex mb-5">
                                <div className="w-1/3">
                                    <p className="mt-2">Schedule</p>
                                </div>

                                <div className="w-2/3 flex items-center gap-3">
                                    <Input type="date" name="date" onChange={handleChangeForm} />
                                    <Input type="time" name="time" onChange={handleChangeForm} />
                                </div>
                            </div>

                            <div className="flex items-center justify-end">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="contained"
                                        color="gray"
                                        onClick={(e) => handleClickToggleForm(false)}
                                    >
                                        Cancel
                                    </Button>

                                    <Button type="submit" variant="contained" color="blue">
                                        Save Automation
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {!form.show && (
                        <div className="create_button pt-10 z-10">
                            <Button
                                className="rounded-lg border-[3px]"
                                variant="outlined"
                                color="primary"
                                onClick={(e) => handleClickToggleForm(true)}
                            >
                                <AddIcon width={20} height={19} />
                                Add Selected to List
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CreateAutomation;
