import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { BsSearch } from "react-icons/bs";
import { checkUsers } from "../../../apis";
import { Button, Input, Spinner } from "../../../components";
import handleError from "../../../utils/errorHandler";
import firebaseReAuth from "../../../utils/firebaseReAuth";
import UserDetailsModel from "./UserDetailsModel";
// import { CheckBox, Chip, Input, Printer, SortIcon, Spinner } from "../../../components";

const Users = () => {
    const searchBtnRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState({ email: "" });
    const [users, setUsers] = useState([]);
    const [userModel, setUserModel] = useState({ open: false });

    const [page, setPage] = useState({
        page: 1,
        total: 0,
        totalPage: 1,
        perPage: 50,
        fetching: false,
        err: null,
    });

    const handleClickSearchUsers = async () => {
        try {
            if (!searchTerm.email.trim()) throw new Error("Enter email address to search");

            setPage({ ...page, fetching: true, err: null });

            const data = {
                google_auth_key: localStorage.getItem("access_token"),
                search_email: searchTerm.email,
            };

            const { data: res } = await checkUsers(data);
            if (res.status !== "success") throw new Error(res.data);

            if (!Array.isArray(res.data)) throw new Error(res.data?.toString());

            setUsers(res.data);
            setPage({ ...page, fetching: false, err: null });
        } catch (err) {
            setPage({ ...page, fetching: false, err: err.message });
            if (err.message.includes("unable to retrieve user information from given auth key")) {
                const toastId = toast.loading("Session expired. Re-Authenticating");
                firebaseReAuth(0, toastId, (status, result) => {
                    if (status === false) return;

                    if (searchBtnRef.current) searchBtnRef.current.click();
                    setPage({ ...page, err: null });
                });
            } else {
                handleError(err);
            }
        }
    };

    return (
        <div className="users_page page">
            <section className="filters mb-5">
                <div className="f-center flex-col gap-2 pb-2 font-medium max-w-sm mx-auto">
                    <p>Search: </p>

                    <div className="flex gap-2 items-center w-full">
                        <Input
                            type="email"
                            placeholder="Search by email..."
                            size="md"
                            onChange={(e) => setSearchTerm({ ...searchTerm, email: e.target.value })}
                        />
                        <Button
                            ref={searchBtnRef}
                            className="!rounded-md"
                            variant="contained"
                            color="primary"
                            size="xl"
                            disabled={page.fetching}
                            onClick={handleClickSearchUsers}
                        >
                            <BsSearch />
                        </Button>
                    </div>
                </div>
            </section>

            <section className="users_list">
                {page.fetching && (
                    <div className="f-center w-full mb-5">
                        <Spinner />
                    </div>
                )}

                <div className="text-center mb-5">
                    {users.length === 0 && <p className="text-xl font-medium">Search users by email address</p>}
                </div>

                <div className="text-center mb-5">
                    {!page.fetching && page.err !== null && (
                        <p className="text-xl text-red-600 font-medium capitalize">{page.err}</p>
                    )}
                </div>

                {users.length !== 0 && (
                    <div className="users w-full max-w-screen-lg mx-auto text-center font-medium border border-gray-100">
                        <div className="item_header text-lg flex items-center gap-4 w-full bg-gray-100 p-2 mb-2">
                            <p className="w-1/12">No</p>
                            <p className="w-8/12">Email</p>
                            <p className="w-3/12">Action</p>
                        </div>

                        {users.map((email, i) => (
                            <div
                                key={i}
                                className="item_body flex items-center gap-4 w-full p-2 text-gray-600 border-b border-b-gray-200 hover:bg-gray-50"
                            >
                                <p className="w-1/12">{i + 1}</p>
                                <p className="w-8/12">{email}</p>
                                <p className="w-3/12 f-center">
                                    <Button
                                        color="blue"
                                        onClick={(e) => setUserModel({ ...userModel, open: true, email: email })}
                                    >
                                        View Details
                                    </Button>
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {userModel.open && (
                <UserDetailsModel data={userModel} onClose={(e) => setUserModel({ ...userModel, open: false })} />
            )}
        </div>
    );
};

export default Users;
