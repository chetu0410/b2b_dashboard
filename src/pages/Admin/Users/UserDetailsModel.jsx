import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdClose } from "react-icons/md";
import { getUserInformation, updateUserCredit } from "../../../apis";

import { Button, Input, Spinner } from "../../../components";
import handleError from "../../../utils/errorHandler";

const UserDetailsModel = ({ data = {}, onClose }) => {
    const [userData, setUserData] = useState({
        new_credit_balance: "",
        email: data.email,
        fetching: false,
        err: null,
    });

    const fetchUserInformation = async (data) => {
        try {
            setUserData({ ...userData, fetching: true, err: null });
            const { data: res } = await getUserInformation(data);
            if (res.status !== "success") throw new Error(res.data?.toString());

            setUserData({ ...userData, ...res.data });
        } catch (err) {
            setUserData({ ...userData, err: err.message });
            console.error(err);
        }
    };

    useEffect(() => {
        const body = {
            google_auth_key: localStorage.getItem("access_token") || "",
            search_email: data.email || "",
        };
        fetchUserInformation(body);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChangeCreditBalanace = (e) => {
        setUserData({ ...userData, new_credit_balance: e.target.value });
    };

    const handleClickUpdateCredit = async (e) => {
        const ti = toast.loading("Updating limit...");
        try {
            if (!userData.new_credit_balance.trim()) throw new Error("Enter limit to update");
            if (Number(userData.new_credit_balance.trim()) > 500) throw new Error("Daily limit must be between 0-500");

            if (!userData.email.trim()) throw new Error("Something went wrong. Couldn't find email");

            const body = {
                google_auth_key: localStorage.getItem("access_token"),
                new_credit_balance: userData.new_credit_balance,
                email_to_update: userData.email,
            };

            const { data: res } = await updateUserCredit(body);
            if (res.status !== "success") throw new Error(res.data?.toString());

            setUserData({ ...userData, daily_balance: userData.new_credit_balance, new_credit_balance: "" });

            console.log(res);
            toast.remove(ti);
            toast.success("Limit updated successfully");
        } catch (err) {
            handleError(err, ti);
        }
    };

    return (
        <div className="f-center fixed top-0 left-0 bottom-0 right-0 p-4 bg-model">
            <div className="flex flex-col justify-between md:min-h-[450px] max-w-md w-full bg-white p-4 rounded-md relative border border-gray-100 shadow-md">
                <span
                    className="absolute top-1 right-1 h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                    onClick={onClose}
                >
                    <MdClose className="text-lg" />
                </span>

                <h2 className="text-lg font-semibold mb-5 md:mb-0">Details</h2>

                {userData.fetching && (
                    <div className="f-center w-full md:min-h-[300px]">
                        <Spinner />
                    </div>
                )}

                {userData.err && (
                    <div className="f-center w-full md:min-h-[300px]">
                        <p className="text-base font-semibold">{userData.err}</p>
                    </div>
                )}

                {!userData.fetching && !userData.err && (
                    <div className="data text-sm">
                        <div className="flex items-center mb-3">
                            <p className="w-32 text-gray-600">UID</p>
                            <p className="text-gray-900 ml-2">{userData.u_id}</p>
                        </div>

                        <div className="flex items-center mb-3">
                            <p className="w-32 text-gray-600">Email</p>
                            <p className="text-gray-900 ml-2">{userData.email}</p>
                        </div>

                        <div className="flex items-center mb-3">
                            <p className="w-32 text-gray-600">Registration Date</p>
                            <p className="text-gray-900 ml-2">{userData.user_created_at}</p>
                        </div>

                        <div className="flex items-center mb-3">
                            <p className="w-32 text-gray-600">Last Active</p>
                            <p className="text-gray-900 ml-2">{userData.last_active}</p>
                        </div>

                        <div className="flex items-center mb-3">
                            <p className="w-32 text-gray-600">Daily Limit</p>
                            <p className="text-gray-900 ml-2">{userData.daily_balance}</p>
                        </div>

                        <div className="flex items-center mb-3">
                            <p className="w-32 text-gray-600">7 Days Activity</p>
                            <p className="text-gray-900 ml-2">{userData.count_last_week}</p>
                        </div>

                        <div className="flex items-center mb-3">
                            <p className="w-32 text-gray-600">30 Days Activity</p>
                            <p className="text-gray-900 ml-2">{userData.count_last_month}</p>
                        </div>
                    </div>
                )}

                <hr className="border-gray-100 my-3" />

                <div className="update_credit_limit">
                    <h3 className="mb-3">Update Daily Limit</h3>

                    <div className="flex items-center gap-3">
                        <Input
                            type="number"
                            value={userData.new_credit_balance}
                            name="new_credit_balance"
                            max="400"
                            min="1"
                            onChange={handleChangeCreditBalanace}
                        />
                        <Button
                            className="!rounded-md"
                            variant="contained"
                            color="primary"
                            size="lg"
                            onClick={handleClickUpdateCredit}
                        >
                            Update
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModel;
