import api from "../Utils/api";

export default function Test(){
    const handleClick = () => {
        console.log("click")
        api.get("").then((res) => {
            console.log("response", res.data)
        })
        .catch((err) => {
            console.log("Error:" + err);
        });
    };

    return(
        <button onClick={handleClick}>
            Button
        </button>
    )
}