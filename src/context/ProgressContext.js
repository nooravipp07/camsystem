import React, { createContext, useState, useContext } from "react";

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    const [progressPayload, setProgressPayload] = useState({
        headerForm: {
            sppgId: "",
            total_progress: 0,
            reportedBy: "",
            reportedTo: "",
            description: "",
        },
        generalInformation: {
            tasksPerformed: [],
            materialsUsed: [],
            toolsUsed: [],
            weatherCondition: "",
            obstacles: "",
            suggestion: "",
            uploadedFiles: [],
            signatureBase64Img: "",
            signerPosition: "",
            signerName: "",
        },
    });

    const updateProgressPayload = (section, data) => {
        setProgressPayload((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                ...data,
            },
        }));
    };

    return (
        <ProgressContext.Provider
            value={{ progressPayload, setProgressPayload, updateProgressPayload }}
        >
        {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => useContext(ProgressContext);
