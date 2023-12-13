import { useState, useEffect } from "react";
import Filters from "./Filters";
import IndiamartFilters from "./IndiamartFilters";
import StatusFilter from "./StatusFilter";
import CustomTagFilter from "./CustomTagFilter";

const CombinedFilters = ({ integrationFlag = -1, onSave }) => {
    const [filterShow, setFilterShow] = useState(false);
    const [statusShow, setStatusShow] = useState(false);

    useEffect(() => {
        if (filterShow) setStatusShow(false);
    }, [filterShow]);

    useEffect(() => {
        if (statusShow) setFilterShow(false);
    }, [statusShow]);

    return (
        <div className="flex items-center gap-4">
            {integrationFlag === 0 && <Filters onSave={onSave} stat={filterShow} onShow={setFilterShow} />}
            {integrationFlag === 1 && <IndiamartFilters onSave={onSave} stat={filterShow} onShow={setFilterShow} />}
            <StatusFilter onSave={onSave} stat={statusShow} onShow={setStatusShow} />
            
        </div>
    );
};

export default CombinedFilters;
