import classNames from "classnames";

const Printer1 = ({ value,sequenceId, msg = "-" }) => {
    const colors = ['bg-green-500',"bg-pink-500","bg-orange-600","bg-amber-500","bg-yellow-400","bg-sky-600","bg-pink-500"]
    console.log(sequenceId,'index is defined')
    return(
        <>
            <div className={classNames(
                        "block px-3 py-1 rounded-full  text-sm text-center",
                      
                    )}>
                {value || msg}
            </div>

        </>
    ) ;
};

export default Printer1;
