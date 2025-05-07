import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { TiFlash } from "react-icons/ti";
import { BsQuestionDiamondFill } from "react-icons/bs";


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

export const getFlashCardVisibility = (flashCard: boolean) => {
    if (flashCard) {
        return (
            <p className="text-yellow-500 flex items-center gap-1"><TiFlash />FlashCard  </p>
        )
    } else {
        return (
            <p className="text-blue-500 flex items-center gap-1"><BsQuestionDiamondFill/>Quiz</p>
        )
    }
}