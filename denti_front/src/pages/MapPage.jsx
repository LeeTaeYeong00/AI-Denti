import { useEffect, useState } from "react";
import axios from "axios";

function MapPage() {
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
        getAddresses();
    }, []);

    const getAddresses = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/repair-shop-addresses"
            );

            console.log("주소 데이터:", response.data);

            setAddresses(response.data);
        } catch (error) {
            console.error("주소 조회 실패:", error);
        }
    };

    return (
        <div>
            <h1>정비소 지도</h1>

            {addresses.map((address) => (
                <div key={address.addressId}>
                    <p>주소: {address.address}</p>
                    <p>위도: {address.latitude}</p>
                    <p>경도: {address.longitude}</p>
                    <hr />
                </div>
            ))}
        </div>
    );
}

export default MapPage;