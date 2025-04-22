import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export const getVisibility = (visibility: boolean) => {
    if (visibility) {
        return (
            <p className="text-green-500 flex items-center gap-1"><AiFillEye />Visible  </p>
        )
    } else {
        return (
            <p className="text-red-500 flex items-center gap-1"><AiFillEyeInvisible />Hidden  </p>
        )
    }
}