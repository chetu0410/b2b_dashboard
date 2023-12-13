import { useContext, useEffect, useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import handleError from "../../../utils/errorHandler";
import { Footer, Header, PageLoading } from "../../../components";
import AuthContext from "../../../context/AuthContext";
import {
    IndiamartIntegration,
    FacebookIntegration,
    TradeIndiaIntegration,
    LeadbotLoginComponent,
    SupportComponent,
} from "../../../components";
import WhatsappLoginComponent from "../../../components/SendMessage/WhatsappLoginComponent";

const AdminOutlet = () => {
    const navigate = useNavigate();
    const { authUser } = useContext(AuthContext);
    const savedLeadbotStatus = useMemo(() => {
        try {
            return localStorage.getItem("leadbot-login-status")
                ? JSON.parse(localStorage.getItem("leadbot-login-status"))
                : 0;
        } catch (err) {
            return 0;
        }
    }, []);

    const [indiamartModel, setIndiamartModel] = useState({ open: false });
    const [facebookModel, setFacebookModel] = useState({ open: false });
    const [tradeIndiaModel, setTradeIndiaModel] = useState({ open: false });

    const [leadbotStatus, setLeadbotStatus] = useState(savedLeadbotStatus === 1 ? true : false);
    const [leadbotModel, setLeadbotModel] = useState({ open: false });

    const [seleniumStatus, setSeleniumStatus] = useState(null);
    const [lastLoginTime, setLastLoginTime] = useState("");
    const [whatsappModel, setWhatsappModel] = useState({ open: false });

    const [supportModel, setSupportModel] = useState({ open: false });

    const parent = useMemo(() => {
        try {
            return localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};
        } catch (err) {
            return {};
        }
    }, []);

    const integrations = useMemo(() => {
        try {
            return localStorage.getItem("integrations") ? JSON.parse(localStorage.getItem("integrations")) : [];
        } catch (err) {
            return [];
        }
    }, []);

    useEffect(() => {
        //check leadbot login status on header render, if already logged in then set status to true
        async function checkLeadbotStatus() {
            const url = "https://lb-central.trending-trends.com/lead_bot/getLoginStatus";
            const body = { b2b_user_uid: parent.parent_user_uid };
            console.log(parent.parent_user_uid,'parent.parent_user_uid')
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (response.status !== 200) {
                console.log("Error occured for getLoginStatus");
                setLeadbotStatus(false);
            }

            const data = await response.json();

            localStorage.setItem("leadbot-login-status", JSON.stringify(data.login_status));

            if (data.login_status === 0) {
                setLeadbotStatus(false);
            }

            if (data.login_status === 1) {
                setLeadbotStatus(true);
            }
        }
        checkLeadbotStatus();

        const checkSeleniumStatus = async () => {
            //const url = "https://wa-mktg.trending-trends.com/wa_logincheck";
            const url = "https://wa-mktg.trending-trends.com/wa_login_record_check";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_uid: parent.parent_user_uid }),
            });

            if (response.status === 200) {
                const data = await response.json();
                if (data.login_status === 1) {
                    setSeleniumStatus(true);
                    setLastLoginTime(data.last_check_time);
                } else setSeleniumStatus(false);
            } else toast.error("Error in checking WhatsApp Login.");

            /*if (response.status === 200) setSeleniumStatus(true);
            else if (response.status === 403) setSeleniumStatus(false);
            else toast.error("Error in checking WhatsApp Login.");*/
        };
        checkSeleniumStatus();
    }, []);

    useEffect(() => {
        if (authUser.auth === false) {
            navigate("/dev/auth/login");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser]);

    if (authUser.loading || authUser.auth === false) return <PageLoading />;

    const handleClickToggleIndiamart = (open) => {
        setIndiamartModel({ ...indiamartModel, open: !indiamartModel.open });
    };

    const handleClickToggleFacebook = (open) => {
        setFacebookModel({ ...facebookModel, open: !facebookModel.open });
    };
    const handleClickToggleTradeIndia = (open) => {
        setTradeIndiaModel({ ...tradeIndiaModel, open: !tradeIndiaModel.open });
    };

    const handleClickToggleLeadbot = (open) => {
        setLeadbotModel({ ...leadbotModel, open: !leadbotModel.open });
    };

    const handleClickToggleWhatsapp = (open) => {
        setWhatsappModel({ ...whatsappModel, open: !whatsappModel.open });
    };

    const handleClickToggleSupport = (open) => {
        setSupportModel({ ...supportModel, open: !supportModel.open });
    };

    const handleClickIntegration = async (e) => {
        const tId = toast;
        try {
            // eslint-disable-next-line default-case
            switch (e) {
                case 1:
                    setIndiamartModel({ ...indiamartModel, open: !indiamartModel.open });
                    break;
                case 2:
                    setFacebookModel({ ...facebookModel, open: !facebookModel.open });
                    break;
                case 3:
                    setTradeIndiaModel({ ...tradeIndiaModel, open: !tradeIndiaModel.open });
                    break;
                default:
                    console.error("Couldn't find Integration. Please check.");
                    break;
            }
        } catch (err) {
            console.log(err);
            handleError(err, tId);
        }
    };

    const handleClickLeadbot = async () => {
        const tId = toast;
        try {
            /*if (integrations.length === 0)
                throw new Error("You must be integrated with IndiaMART to use AutoResponder!");*/
            if (leadbotStatus)
                toast.success("AutoResponder is logged in and enabled!", {
                    style: {
                        maxWidth: 400,
                    },
                });
            else setLeadbotModel({ ...leadbotModel, open: !leadbotModel.open });
        } catch (err) {
            console.log(err);
            handleError(err, tId);
        }
    };

    const handleClickWhatsapp = async () => {
        const tId = toast;
        try {
            /*if (integrations.length === 0)
                throw new Error("You must be integrated with IndiaMART to use AutoResponder!");*/
            if (seleniumStatus)
                toast.success(
                    `You are signed-in with Marketing WhatsApp! ${
                        lastLoginTime ? `\nLast Active Sign-in detected at ${lastLoginTime}.` : ""
                    }`,
                    {
                        style: {
                            maxWidth: 500,
                        },
                    }
                );
            else setWhatsappModel({ ...whatsappModel, open: !whatsappModel.open });
        } catch (err) {
            console.log(err);
            handleError(err, tId);
        }
    };

    const handleClickSupport = async (e) => {
        const tId = toast;
        try {
            setSupportModel({ ...supportModel, open: !supportModel.open });
        } catch (err) {
            console.log(err);
            handleError(err, tId);
        }
    };

    return (
        <div className="admin_outlet bg-gray-50">
            <Header
                integrations={integrations}
                integrationCall={handleClickIntegration}
                leadbotStatus={leadbotStatus}
                leadbotCall={handleClickLeadbot}
                seleniumStatus={seleniumStatus}
                seleniumCall={handleClickWhatsapp}
            />

            <main className="min-h-[calc(100vh-120px)] max-w-screen-2xl mx-auto px-4 py-6 font-normal">
                <Outlet />
            </main>
            {indiamartModel.open && (
                <section className="register_indiamart fixed top-0 right-0 bottom-0 h-full max-w-l w-full">
                    <IndiamartIntegration onClose={(e) => handleClickToggleIndiamart(false)} />
                </section>
            )}
            {facebookModel.open && (
                <section className="register_facebook fixed top-0 right-0 bottom-0 h-full max-w-l w-full">
                    <FacebookIntegration onClose={(e) => handleClickToggleFacebook(false)} />
                </section>
            )}
            {tradeIndiaModel.open && (
                <section className="register_facebook fixed top-0 right-0 bottom-0 h-full max-w-l w-full">
                    <TradeIndiaIntegration onClose={(e) => handleClickToggleTradeIndia(false)} />
                </section>
            )}
            {leadbotModel.open && (
                <section className="register_leadbot fixed top-0 right-0 bottom-0 h-full max-w-l w-full">
                    <LeadbotLoginComponent
                        integrations={integrations}
                        onClose={(e) => handleClickToggleLeadbot(false)}
                    />
                </section>
            )}
            {whatsappModel.open && (
                <section className="register_whatsapp fixed top-0 right-0 bottom-0 h-full max-w-l w-full">
                    <WhatsappLoginComponent onClose={(e) => handleClickToggleWhatsapp(false)} />
                </section>
            )}

            <Footer supportCall={handleClickSupport} />
            {supportModel.open && (
                <div className="support fixed right-0 bottom-0 h-fit max-w-md w-full">
                    <SupportComponent onClose={(e) => handleClickToggleSupport(false)} />
                </div>
            )}
        </div>
    );
};

export default AdminOutlet;
