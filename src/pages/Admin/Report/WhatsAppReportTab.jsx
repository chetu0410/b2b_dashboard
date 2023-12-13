import React from "react";
import classNames from "classnames";

import { WhatsAppIcon, Printer } from "../../../components";

const WhatsAppReportTab = ({ fetching, data }) => {
    const index = data.findIndex((obj) => "self_account_email" in obj);

    return (
        <section>
            {!fetching && data.length !== 0 && (
                <div className="content mb-5">
                    <div className="block text-lg font-bold my-4">Self Account WhatsApp Report:</div>
                    <div className="flex items-center justify-between px-4 py-4 rounded-md shadow-app1 mb-6">
                        <div className="flex items-center">
                            <span className="w-12 h-12 f-center border border-green-500 rounded-full">
                                <WhatsAppIcon height={23} width={24} />
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
                                    <h6 className="text-3xl font-semibold text-primary text-center">
                                        {data[index]?.self_account_report["sent_count"]}
                                    </h6>
                                    <p className="text-sm font-medium text-gray-600">Sent Messages</p>
                                </div>

                                <div className="group">
                                    <h6 className="text-3xl font-semibold text-green-700 text-center">
                                        {data[index]?.self_account_report["delivered_count"]}
                                    </h6>
                                    <p className="text-sm font-medium text-gray-600">Delivered Messages</p>
                                </div>

                                <div className="group">
                                    <h6 className="text-3xl font-semibold text-blue-500 text-center">
                                        {data[index]?.self_account_report["read_count"]}
                                    </h6>
                                    <p className="text-sm font-medium text-gray-600">Read Messages</p>
                                </div>

                                <div className="group">
                                    <h6 className="text-3xl font-semibold text-red-500 text-center">
                                        {data[index]?.self_account_report["replied_count"]}
                                    </h6>
                                    <p className="text-sm font-medium text-gray-600">Replies Received</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {data.length > 1 && (
                        <>
                            <div className="block text-lg font-bold my-4">Child Account(s) WhatsApp Report(s):</div>
                            {[...data.slice(0, index), ...data.slice(index + 1)].map((details, i) => {
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between px-4 py-4 rounded-md shadow-app1 mb-6"
                                    >
                                        <div className="flex items-center">
                                            <span className="w-12 h-12 f-center border border-green-500 rounded-full">
                                                <WhatsAppIcon height={23} width={24} />
                                            </span>

                                            <div className="max-w-md ml-4 ">
                                                <p className="text-lg font-medium leading-none mb-0.5">
                                                    <span className="text-gray-600 mr-2">Email:</span>

                                                    <Printer value={details?.child_account_email} />
                                                </p>
                                                <p className={classNames("text-lg font-medium leading-none")}>
                                                    <span className="text-gray-600 mr-2">Name:</span>

                                                    <Printer value={details?.child_account_username} />
                                                </p>
                                            </div>
                                        </div>

                                        <div className="details flex items-center gap-16">
                                            <div className="flex items-center gap-8">
                                                <div className="group">
                                                    <h6 className="text-3xl font-semibold text-primary text-center">
                                                        {details.child_account_report["sent_count"]}
                                                    </h6>
                                                    <p className="text-sm font-medium text-gray-600">Sent Messages</p>
                                                </div>

                                                <div className="group">
                                                    <h6 className="text-3xl font-semibold text-green-700 text-center">
                                                        {details.child_account_report["delivered_count"]}
                                                    </h6>
                                                    <p className="text-sm font-medium text-gray-600">
                                                        Delivered Messages
                                                    </p>
                                                </div>

                                                <div className="group">
                                                    <h6 className="text-3xl font-semibold text-blue-500 text-center">
                                                        {details.child_account_report["read_count"]}
                                                    </h6>
                                                    <p className="text-sm font-medium text-gray-600">Read Messages</p>
                                                </div>

                                                <div className="group">
                                                    <h6 className="text-3xl font-semibold text-red-500 text-center">
                                                        {details.child_account_report["replied_count"]}
                                                    </h6>
                                                    <p className="text-sm font-medium text-gray-600">
                                                        Replies Received
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </section>
    );
};

export default WhatsAppReportTab;
