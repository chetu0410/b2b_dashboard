import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

import { Button, DeleteIcon, EditIcon, SearchInput, WhatsAppIcon } from "../../../components";

const data = [
    { name: "Restaurant Leads - Chat Whats app Automation" },
    { name: "Untitled" },
    { name: "300 Medical Leads " },
];

const Automation = () => {
    return (
        <div className="automation_page page">
            <div className="flex items-center justify-between gap-4 mb-10">
                <h2 className="text-xl font-bold">Campaigns</h2>

                <div className="flex items-center gap-4 max-w-lg w-full">
                    <div className="max-w-sm w-full shadow-md">
                        <SearchInput className="rounded-md" placeholder="Search" />
                    </div>

                    <Button variant="contained" color="blue">
                        <FaPlus className="text-white text-base" />
                        CREATE LIST
                    </Button>
                </div>
            </div>

            <div className="content">
                {data.map((details, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-4 rounded-md shadow-app1 mb-6">
                        <div className="flex items-center">
                            <span className="w-12 h-12 f-center border border-green-500 rounded-full">
                                <WhatsAppIcon height={23} width={24} />
                            </span>

                            <div className="max-w-xs ml-4 ">
                                <p className="text-lg font-medium leading-none">{details.name}</p>
                            </div>
                        </div>

                        <div className="details flex items-center gap-16">
                            <div className="flex items-center gap-8">
                                <div className="group">
                                    <h6 className="text-3xl font-semibold text-primary">4.3K</h6>
                                    <p className="text-sm font-medium text-gray-600">Total Searches</p>
                                </div>

                                <div className="group">
                                    <h6 className="text-3xl font-semibold text-green-600">4.3K</h6>
                                    <p className="text-sm font-medium text-gray-600">Message Send</p>
                                </div>

                                <div className="group">
                                    <h6 className="text-3xl font-semibold text-blue-400">4.3K</h6>
                                    <p className="text-sm font-medium text-gray-600">Replies Received</p>
                                </div>

                                <div className="group">
                                    <h6 className="text-3xl font-semibold text-red-500">4.3K</h6>
                                    <p className="text-sm font-medium text-gray-600">Failed to Send</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="cursor-pointer">
                                    <Link to="/dev/admin/automation/create">
                                        <EditIcon />
                                    </Link>
                                </div>

                                <div className="cursor-pointer">
                                    <DeleteIcon />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Automation;
