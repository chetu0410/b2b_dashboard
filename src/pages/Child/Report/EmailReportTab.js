import React from "react";
import classNames from "classnames";
import { MdOutlineMailOutline } from "react-icons/md";
import {  Printer } from "../../../components";

const EmailReportTab = ({ fetching, data }) => {
    const index = data.findIndex((obj) => "child_account_email" in obj);

    return (
        <section>
            <div className="content mb-5">
                {/* {/<div className="block text-lg font-bold my-4">Child Account WhatsApp Report:</div>/} */}
                <div className="flex items-center justify-between px-4 py-4 rounded-md shadow-app1 mb-6">
                    <div className="flex items-center">
                            <span className="w-12 h-12 f-center border border-blue-500 rounded-full">
                                <MdOutlineMailOutline height={30} width={26} />
                            </span>

                        <div className="max-w-md ml-4 ">
                            <p className="text-lg font-medium leading-none mb-0.5">
                                <span className="text-gray-600 mr-2">Email:</span>
                                <Printer value={data[index]?.self_account_email} />
                            </p>
                            <p className={classNames("text-lg font-medium leading-none")}>
                                <span className="text-gray-600 mr-2">Name:</span>
                                <Printer value={data[index]?.self_account_username} />
                            </p>
                        </div>
                    </div>

                    <div className="details flex items-center gap-16">
                        <div className="flex items-center gap-8">
                            <div className="group">
                                <h6 className="text-3xl font-semibold text-yellow-500 text-center">
                                    {data[index]?.child_account_report["total_emails_scheduled"]}
                                </h6>
                                <p className="text-sm font-medium text-gray-600">Schedule Email</p>
                            </div>

                            <div className="group">
                                    <h6 className="text-3xl font-semibold text-green-700 text-center">
                                        {data[index]?.self_account_report["total_emails_sent"]}
                                    </h6>
                                    <p className="text-sm font-medium text-gray-600">Sent Email</p>
                                </div>
                            <div className="group">
                                <h6 className="text-3xl font-semibold text-blue-600 text-center">
                                    {data[index]?.child_account_report["total_emails_opened"]}
                                </h6>
                                <p className="text-sm font-medium text-gray-600">opened Email</p>
                            </div>

                            <div className="group">
                                <h6 className="text-3xl font-semibold text-red-500 text-center">
                                    {data[index]?.child_account_report["total_invalid_emails"]}
                                </h6>
                                <p className="text-sm font-medium text-gray-600">Invalid Email</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {!fetching && data.length === 0 && <p className="text-center text-xl">No data found</p>}
        </section>
    );
};

export default EmailReportTab;