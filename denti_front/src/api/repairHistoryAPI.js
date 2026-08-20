import axios from "axios";

export const getRepairHistoriesByUser = async (userId) => {
    const response = await axios.get(
        `http://localhost:8080/api/repair-histories/user/${userId}`,
        {
            withCredentials: true,
        }
    );

    return response.data;
};