import classNames from "classnames";

/**
 *	Connect Status Flags & Colours:
 *	0 - Wrong Number | Pink
 *	1 - Not Connected | Blue
 *	2 - Connected | Green
 *
 *	Lead Status Flags & Colours:
 *	0 - Interested | Green
 *	1 - Not Interested | Pink
 *	2 - Call Tomorrow | Orange
 *	3 - Call Day After | Amber
 *	4 - Call Next Week | Yellow
 *	5 - Call On <Date> | Sky
 **/

const CallStatus = ({ className, leadStatus = null, connectStatus = null, indicator = 1, callDate = "" }) => {
    let leadVariant = {
        0: {
            text: "Interested",
            color: "bg-green-500",
        },
        1: {
            text: "Not Interested",
            color: "bg-pink-500",
        },
        2: {
            text: "Call Tomorrow",
            color: "bg-orange-600",
        },
        3: {
            text: "Call Day After",
            color: "bg-amber-500",
        },
        4: {
            text: "Call Next Week",
            color: "bg-yellow-400",
        },
        5: {
            text: `Call On ${callDate}`,
            color: "bg-sky-600",
        },
    };

    let connectVariant = {
        0: {
            text: "Wrong Number",
            color: "bg-pink-500",
        },
        1: {
            text: "Not Connected",
            color: "bg-blue-500",
        },
        2: {
            text: "Connected",
            color: "bg-green-500",
        },
    };

    return (
        <div className="call_info">
            {leadStatus !== null && leadStatus > -1 ? (
                <span
                    className={classNames(
                        "block px-3 py-1 rounded-full font-bold text-xs text-center mb-1",
                        leadVariant.hasOwnProperty(leadStatus) ? leadVariant[leadStatus].color : "bg-red-500",
                        className
                    )}
                >
                    {leadVariant.hasOwnProperty(leadStatus) ? leadVariant[leadStatus].text : "ERROR"}
                </span>
            ) : (
                indicator === 1 && <span className="block px-6 text-center">-</span>
            )}

            {connectStatus !== null && connectStatus > -1 ? (
                <span
                    className={classNames(
                        "block px-3 py-1 rounded-full font-bold text-xs text-center",
                        connectVariant.hasOwnProperty(connectStatus)
                            ? connectVariant[connectStatus].color
                            : "bg-red-500",
                        className
                    )}
                >
                    {connectVariant.hasOwnProperty(connectStatus) ? connectVariant[connectStatus].text : "ERROR"}
                </span>
            ) : (
                indicator === 2 && <span className="block px-6 text-center">-</span>
            )}
        </div>
    );
};

export default CallStatus;
