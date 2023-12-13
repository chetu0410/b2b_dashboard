const CallIcon = ({ height, width, color = "#0070E2" }) => {
    return (
        <svg
            width={width || "16"}
            height={height || "17"}
            viewBox="0 0 16 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M15.2229 11.2441L11.4652 9.64169C11.2714 9.55479 11.0585 9.51875 10.8468 9.53697C10.6351 9.5552 10.4316 9.62708 10.2554 9.74584L8.2444 11.0839C7.01875 10.4886 6.02641 9.50187 5.42415 8.27964L6.75416 6.24458C6.87213 6.06822 6.94418 5.86518 6.96376 5.65391C6.98335 5.44263 6.94986 5.22981 6.86632 5.03476L5.2559 1.27711C5.14353 1.02338 4.95325 0.812043 4.71267 0.673744C4.47208 0.535444 4.1937 0.477375 3.91789 0.507956C2.83594 0.649692 1.84227 1.1795 1.12162 1.99888C0.400982 2.81826 0.0024055 3.87146 0 4.96265C0 11.3242 5.17578 16.5 11.5373 16.5C12.6285 16.4976 13.6817 16.099 14.5011 15.3784C15.3205 14.6577 15.8503 13.6641 15.992 12.5821C16.0226 12.3063 15.9646 12.0279 15.8263 11.7873C15.688 11.5467 15.4766 11.3565 15.2229 11.2441Z"
                fill={color}
            />
            <path
                d="M10.0471 2.37477C11.0227 2.64132 11.912 3.15765 12.6272 3.87282C13.3424 4.58798 13.8587 5.47726 14.1252 6.4529C14.1606 6.58988 14.2403 6.71131 14.3519 6.79826C14.4635 6.88522 14.6007 6.93281 14.7422 6.93362C14.7991 6.93352 14.8557 6.92543 14.9104 6.90959C14.9919 6.88827 15.0683 6.8509 15.1352 6.79968C15.202 6.74846 15.258 6.68441 15.2998 6.61128C15.3415 6.53816 15.3683 6.45743 15.3785 6.37383C15.3887 6.29022 15.3821 6.20543 15.3591 6.12441C15.0386 4.92956 14.4094 3.84006 13.5347 2.96531C12.6599 2.09057 11.5704 1.46138 10.3756 1.14091C10.292 1.11046 10.203 1.09774 10.1142 1.10357C10.0254 1.10941 9.93877 1.13367 9.85986 1.17481C9.78096 1.21595 9.71149 1.27307 9.65587 1.34253C9.60025 1.41199 9.5597 1.49227 9.53681 1.57826C9.51392 1.66425 9.50918 1.75406 9.5229 1.84198C9.53662 1.9299 9.56849 2.014 9.6165 2.08893C9.6645 2.16385 9.72757 2.22796 9.80171 2.27718C9.87585 2.32639 9.95942 2.35963 10.0471 2.37477Z"
                fill={color}
            />
            <path
                d="M9.3821 4.85048C9.92443 4.99894 10.4187 5.2861 10.8163 5.68369C11.2139 6.08127 11.5011 6.57557 11.6495 7.11789C11.6836 7.25555 11.763 7.37777 11.8748 7.46494C11.9867 7.55211 12.1246 7.59919 12.2664 7.59862C12.3208 7.59915 12.3749 7.59103 12.4267 7.57458C12.5089 7.55414 12.5861 7.51741 12.6539 7.46656C12.7216 7.41571 12.7785 7.35179 12.8211 7.27857C12.8637 7.20535 12.8911 7.12432 12.9018 7.0403C12.9125 6.95627 12.9062 6.87096 12.8834 6.7894C12.681 6.02786 12.281 5.33333 11.7238 4.77616C11.1667 4.21899 10.4721 3.81897 9.7106 3.61663C9.62699 3.58617 9.53795 3.57345 9.44916 3.57929C9.36037 3.58512 9.27376 3.60938 9.19486 3.65052C9.11596 3.69166 9.04648 3.74878 8.99086 3.81824C8.93525 3.8877 8.8947 3.96798 8.87181 4.05397C8.84891 4.13996 8.84417 4.22977 8.85789 4.31769C8.87161 4.40561 8.90349 4.48971 8.95149 4.56464C8.99949 4.63957 9.06257 4.70368 9.13671 4.75289C9.21085 4.8021 9.29442 4.83534 9.3821 4.85048Z"
                fill={color}
            />
        </svg>
    );
};

export default CallIcon;