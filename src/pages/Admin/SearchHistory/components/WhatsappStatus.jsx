import React from "react";
import { FaRobot } from "react-icons/fa";
import { BsCheck, BsCheckAll, BsFillReplyFill } from "react-icons/bs";
import { Tooltip } from "react-tooltip";
import "../../../../assets/css/whatsappstatus.css";

const WhatsappStatus = ({ leadbotMsgSent, leadbotMsgSeen, leadbotMsgReplied, leadbotResponse }) => {
    return (
        <div>
            <span
                className="block flex gap-2"
                data-tooltip-content={leadbotResponse} // Add the tooltip content
                data-tooltip-id="leadbotTooltip"
            >
                {leadbotMsgSent === 1 && <FaRobot style={{ color: "#09D261", fontSize: "2rem" }} />}
                {leadbotMsgSent === 1 && leadbotMsgSeen === 0 && (
                    <BsCheck style={{ color: "#AEAEAE", fontSize: "2rem" }} />
                )}
                {leadbotMsgSent === 1 && leadbotMsgSeen === 1 && leadbotMsgReplied === 0 && (
                    <BsCheckAll style={{ color: "#4FB6EC", fontSize: "2rem" }} />
                )}
                {leadbotMsgSent === 1 && leadbotMsgSeen === 1 && leadbotMsgReplied === 1 && (
                    <BsFillReplyFill
                        style={{
                            color: "#AEAEAE",
                            fontSize: "2rem",
                        }}
                    />
                )}
            </span>
            {/* Define the tooltip */}
            {leadbotResponse !== "" && <Tooltip id="leadbotTooltip" className="whatsapp-tooltip" />}
        </div>
    );
};

export default WhatsappStatus;
