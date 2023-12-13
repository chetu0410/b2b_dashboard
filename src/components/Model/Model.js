// import React from "react";
// import { MdClose } from "react-icons/md";
// import { useState, useEffect } from "react";
// import { RiAlbumLine } from "react-icons/ri";
// import Popup from "reactjs-popup";
// import "reactjs-popup/dist/index.css";
// import { CiCircleChevRight } from "react-icons/ci";
// import { BiSolidTagAlt } from "react-icons/bi";
// import { BiCheck } from "react-icons/bi";
// import { useMemo } from "react";
// const Model = () => {
//     const [CustomData, setCustomData] = useState(null);

//     // const parent = localStorage.getItem("self");
//     const parent = localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};

//     const [customTag, setCustomTag] = useState('');
//     const [sequenceId, setSequenceId] = useState([]);
//     const [customTagsArray, setCustomTagsArray] = useState([]);
//     const [isActiveArray, setIsActiveArray] = useState([]);
//     const[open,setOpen] = useState(false)

//     const handleSubmit = async (e) => {
//       e.preventDefault();

//       // Find a value not in the sequence_id array
//       const newValue = findNewValue(sequenceId);

//       // Update the state with new values
//       setCustomTagsArray([...customTagsArray, customTag]);
//       setIsActiveArray([...isActiveArray, 1]);
//       setSequenceId([...sequenceId, newValue]);
//       setCustomTag('');

//       // Prepare the data object
//       const data = {
//         user_uid: parent.parent_user_uid,
//         sequence_id: [...sequenceId, newValue],
//         custom_tag: [...customTagsArray, customTag],
//         is_active: [...isActiveArray, 1]
//       };
//       //console.log(data,'parent.userid data')
//       try {
//         // Make the API request using fetch
//         const response = await fetch('https://api.procbee.in/global/set_data', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(data),
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const responseData = await response.json();
//         console.log('API Response:', responseData);
//         // Handle any further actions or UI updates as needed
//       } catch (error) {
//         console.error('Error submitting data:', error);
//         // Handle errors or show user feedback
//       }
//     };

//     const findNewValue = (array) => {
//         let newValue;
//         do {
//           // Generate a random number between 10 and 99 (2 digits)
//           newValue = Math.floor(Math.random() * 90) + 10;
//         } while (array.includes(newValue));

//         return newValue;
//       };

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await fetch("https://api.procbee.in/global/get_data", {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({
//                         user_uid: parent.parent_user_uid,
//                     }),
//                 });

//                 if (!response.ok) {
//                     throw new Error("Network response was not ok");
//                 }

//                 const result = await response.json();
//                 setCustomData(result);
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//             }
//         };

//         fetchData();
//     });

//     return (
//         <Popup
//             trigger={
//                 <button className="flex item-center justify-center gap-1">
//                     <span className="mt-[4px] ">
//                         <BiSolidTagAlt />
//                     </span>{" "}
//                     Custom Tag{" "}
//                 </button>
//             }
//             modal
//             nested
//         >
//             {(close) => (
//                 <div className="w-full h-[400px]">
//                     <div className="p-4 max-w-4xl w-full mx-auto mt-3 mb-3 bg-white rounded-lg shadow-lg hero">
//                         <div className="title flex items-center justify-between mb-5">
//                             <h2 className="text-xl font-bold flex gap-2 items-center justify-left">
//                                 <BiSolidTagAlt /> Custom Tags
//                             </h2>
//                             <button className="f-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all bg-yellow-500 text-black  px-1 ml-[50px] py-0.5 text-md !px-2 !text-black">
//                                 Create New Custom Tag
//                             </button>

//                             <div
//                                 className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
//                                 onClick={() => close()}
//                             >
//                                 <MdClose className="text-lg" />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-2 divide-x divide-dashed divide-neutral-200 gap-2 ">
//                             <div className="relative">
//                                 {CustomData   && (
//                                     <ul className="ml-[30px] ">
//                                         {CustomData.data
//                                             .filter((item) => item.is_active === 1)
//                                             .map((item) => (
//                                                 <li
//                                                     key={item.sequence_id}
//                                                     className="basis-1/3 text-gray-600 font-medium mb-3 flex   gap-4"
//                                                 >
//                                                     <span className="mt-[5px]">
//                                                         <CiCircleChevRight />
//                                                     </span>

//                                                     {item.custom_tag}
//                                                 </li>
//                                             ))}
//                                     </ul>
//                                 )}
//                             </div>

//                             <div className="w-full pr-2">
//                                 <form onSubmit={handleSubmit} className="mb-4 mt-2">
//                                     <label className="block font-medium mb-1 text-sm">Custom Tag Name:</label>
//                                     <input
//                                         type="text"
//                                         value={customTag}
//                                         className="w-full text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
//                                         onChange={(e) => setCustomTag(e.target.value)}
//                                     />
//                                     <div className="flex items-center justify-center gap-4 mt-[60px]">
//                                     <button type="submit" className="f-center bg-black text-white p-2 pl-5 pr-5 rounded-md">Submit</button>
//                                     {/* <button  className="f-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all bg-red-600 text-white px-2.5 py-1 text-[30px] h-12 w-12 rounded-full !font-bold !p-0"><MdClose/></button> */}
//                                     </div>

//                                 </form>
//                             </div>

//                         </div>
//                     </div>
//                 </div>
//             )}
//         </Popup>
//     );
// };
// export default Model;

// const findNewValue = (array) => {
//     let newValue = 1;
//     while (array.includes(newValue)) {
//       newValue++;
//     }
//     return newValue;
//   };

// {/* <button
// type="submit"
// className="f-center bg-black text-white p-2 pl-5 pr-5 rounded-md"
// >
// Submit
//{`basis-1/3 w-[150px] text-gray-600  font-medium mb-3  rounded-xl py-[1px] px-4 ml-3 flex gap-4`}
// </button>${colors[index]} */}
//basis-1/3 w-[150px] text-gray-600 font-medium mb-3  rounded-xl py-[1px] px-4 ml-3 flex gap-4
/********************** */

import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { RiAlbumLine } from "react-icons/ri";
import { CiCircleChevRight } from "react-icons/ci";
import { BiSolidTagAlt } from "react-icons/bi";
import { BiCheck } from "react-icons/bi";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useMemo } from "react";
import { IoMdPricetag } from "react-icons/io";
import classNames from "classnames";

const Model = () => {
    const [CustomData, setCustomData] = useState(null);
    const colors = [
        "bg-green-500",
        "bg-pink-500",
        "bg-orange-600",
        "bg-amber-500",
        "bg-yellow-400",
        "bg-sky-600",
        "bg-pink-500",
    ];
    console.log(CustomData, "CustomData is here");
    const sequenceIdArray = [];
    if (CustomData !== null && CustomData !== undefined) {
        CustomData.forEach((element) => {
            sequenceIdArray.push(element.sequence_id);
        });
    }

    console.log(sequenceIdArray, "sequenceIdArray");
    const parent = localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};

    const [customTag, setCustomTag] = useState("");

    const [sequenceId, setSequenceId] = useState([]);
    const [customTagsArray, setCustomTagsArray] = useState([]);
    const [isActiveArray, setIsActiveArray] = useState([]);
    const [buttonClicked, setButtonClicked] = useState(false);
    const [error, setError] = useState("");

    console.log(sequenceId, "sequenceId");
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!customTag) {
            setError("Custom Tag cannot be empty.");
            return;
        }
        if (customTag.length > 30) {
            setError("You can set custom tag upto 30 characters.");
            return;
        }
        if (CustomData != null && CustomData.length > 6) {
            setError("You can create only 7 tags.");
            return;
        }

        setError("");

        // Find a value not in the sequence_id array

        const newValue = findNewValue(sequenceId);

        // Update the state with new values
        setCustomTagsArray([...customTagsArray, customTag]);
        setIsActiveArray([...isActiveArray, 1]);
        setSequenceId([...sequenceId, newValue]);
        setCustomTag("");

        // Prepare the data object
        const data = {
            user_uid: parent.parent_user_uid,
            // user_uid: "05e40656-327f-4f1b-a56a-a20f6efa7a55",
            sequence_id: [...sequenceId, newValue],
            custom_tag: [...customTagsArray, customTag],
            is_active: [...isActiveArray, 1],
        };
        console.log(data, "data in the curl");
        try {
            // Make the API request using fetch
            const response = await fetch("https://api.procbee.in/global/set_data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log("API Response:", responseData);
            // Handle any further actions or UI updates as needed
        } catch (error) {
            console.error("Error submitting data:", error);
            // Handle errors or show user feedback
        }

        setButtonClicked(true);
    };

    const findNewValue = (array) => {
        if (array.length == 0 && sequenceIdArray.length == 0) return 1;
        let newValue = Math.max(...sequenceIdArray);
        return newValue + 1;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("https://api.procbee.in/global/get_data", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_uid: parent.parent_user_uid,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const result = await response.json();
                setCustomData(result.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        setButtonClicked(false);
        fetchData();
    }, [buttonClicked]);

    const handleClear = () => {
        setCustomTag(""); // Set the customTag state to an empty string
    };

    return (
        <Popup
            trigger={
                <button className="flex item-center justify-center gap-1">
                    <span className="mt-[4px] ">
                        <BiSolidTagAlt />
                    </span>{" "}
                    Custom Tag{" "}
                </button>
            }
            modal
            nested
        >
            {(close) => (
                <div className="w-full min-h-[400px]">
                    <div className="p-4 max-w-4xl w-full min-h-[400px]  mx-auto mt-3 mb-3 bg-white rounded-lg  hero">
                        <div className="title flex items-center justify-between mb-5 ml-2">
                            <h2 className="text-xl font-bold flex gap-2 items-center justify-left">
                                <BiSolidTagAlt className="text-slate-700" /> Custom Tags
                            </h2>
                            <div className="f-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all bg-yellow-500 text-black  px-1 lg:ml-[90px] sm:ml-0 py-0.5 text-md !px-2 !text-black">
                                Add Your Custom Tag
                            </div>

                            <div
                                className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                                onClick={() => close()}
                            >
                                <MdClose className="text-lg" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 divide-x divide-dashed divide-neutral-400 gap-2 ">
                            <div className="relative ml-2">
                                <h5 className=" mb-3 text-green-600  flex-wrap text-sm">
                                    Custom tags represents personalized dispositions tailored by the user.
                                </h5>
                                {CustomData != null ? (
                                    <ul className=" ">
                                        {CustomData.filter((item) => item.is_active === 1).map((item, index) => (
                                            <li
                                                key={item.sequence_id}
                                                className={classNames(
                                                    " basis-1/3 w-[150px] text-gray-600 font-medium mb-3  rounded-xl py-[1px] px-4 ml-3 flex gap-4",
                                                   
                                                )}
                                            >
                                                <span className="mt-[5px]">
                                                    <IoMdPricetag />
                                                </span>

                                                {item.custom_tag}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="f-center mt-[50px] mx-[25px]">
                                        <p className="text-sm  font-medium text-gray-500 ">
                                            <div className="text-center mr-[25px]">No Custom Tag defined yet.</div>{" "}
                                            <br />
                                            <br />
                                            <div className="ml-[30xp]">
                                                Note: Custom Tag helps you uniquely identify your lead and enables you
                                                to searching easier amongst other leads.
                                            </div>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="w-full pr-2">
                                <form onSubmit={handleSubmit} className="mb-4 mt-2">
                                    <label className="block font-medium mx-4 mb-1 text-sm">Custom Tag Name:</label>
                                    <input
                                        type="text"
                                        value={customTag}
                                        className="w-[90%] text-sm mx-4 py-2 px-3 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                        onChange={(e) => setCustomTag(e.target.value)}
                                    />
                                    {error && <div className="text-red-500 mt-1 ml-5">{error}</div>}
                                    <div className="flex items-center justify-center gap-4 mt-[60px]">
                                        {customTag ? (
                                            <>
                                                <button
                                                    type="submit"
                                                    className="f-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all bg-green-600 text-white px-2.5 py-1 text-xl h-12 w-12 rounded-full !font-bold !p-0"
                                                >
                                                    <BiCheck className="h-[30px] w-[30px]" />
                                                </button>
                                                <button
                                                    onClick={handleClear}
                                                    className="f-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all bg-red-600 text-white px-2.5 py-1 text-xl h-12 w-12 rounded-full !font-bold !p-0"
                                                >
                                                    <MdClose className="h-[30px] w-[30px]" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="submit"
                                                    className="f-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all bg-[#C0C0C0] text-white px-2.5 py-1 text-xl h-12 w-12 rounded-full !font-bold !p-0"
                                                >
                                                    <BiCheck className="h-[30px] w-[30px]" />
                                                </button>

                                                <button
                                                    onClick={handleClear}
                                                    className="f-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all bg-red-600 text-white px-2.5 py-1 text-xl h-12 w-12 rounded-full !font-bold !p-0"
                                                >
                                                    <MdClose className="h-[30px] w-[30px]" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </form>
                                <div className="f-center mt-[50px] mx-[25px]">
                                    <p className="text-sm text-green-600">
                                        Note: You can create maximum seven custom tags only.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Popup>
    );
};

export default Model;
