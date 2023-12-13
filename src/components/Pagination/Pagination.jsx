import Pagination from "rc-pagination";
import en_GB from "rc-pagination/es/locale/en_GB";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import "rc-pagination/assets/index.css";

import "../../assets/css/pagination.css";

const AppPagination = ({ total, page, perPage, onChange }) => {
    return (
        <Pagination
            current={page}
            pageSize={perPage}
            total={total}
            onChange={onChange}
            locale={en_GB}
            prevIcon={<MdOutlineKeyboardArrowLeft className="text-3xl text-gray-700" />}
            nextIcon={<MdOutlineKeyboardArrowRight className="text-3xl text-gray-700" />}
        />
    );
};

export default AppPagination;
