import { TbWorldCode, TbWorldWww, TbApiApp, TbLogicXor, TbCloudNetwork } from "react-icons/tb";
import { Computer } from "lucide-react";
import { PiTreeStructureBold, PiFloppyDiskBold } from "react-icons/pi";
import { MdWeb, MdHttps, MdLink, MdOutlineDynamicForm, MdOutlineWeb, MdEngineering, MdSpeed, MdOutlineMemory, MdOutlineQuiz, MdOutlineWifiPassword } from "react-icons/md";
import { FaHtml5, FaCss3, FaJsSquare, FaReact, FaSyncAlt, FaRandom, FaShapes } from "react-icons/fa";
import { FaGears } from "react-icons/fa6";
import { LuFileJson2, LuBinary, LuRouter } from "react-icons/lu";
import { SiSemanticuireact } from "react-icons/si";
import { GrNotes, GrDocumentTest, GrConfigure, GrSatellite } from "react-icons/gr";
import { CgIfDesign } from "react-icons/cg";
import { TfiWrite } from "react-icons/tfi";
import { AiOutlineException } from "react-icons/ai";
import { BsHddStack } from "react-icons/bs";
import { IoMdPaper } from "react-icons/io";

const iconMap: { [key: string]: JSX.Element } = {
    default: <MdOutlineQuiz />,
    TbWorldCode: <TbWorldCode />,
    PiTreeStructureBold: <PiTreeStructureBold />,
    Computer: <Computer />,
    TbWorldWww: <TbWorldWww />,
    TbApiApp: <TbApiApp />,
    MdWeb: <MdWeb />,
    MdHttps: <MdHttps />,
    MdLink: <MdLink />,
    MdOutlineDynamicForm: <MdOutlineDynamicForm />,
    MdOutlineWeb: <MdOutlineWeb />,
    FaHtml5: <FaHtml5 />,
    FaCss3: <FaCss3 />,
    FaJsSquare: <FaJsSquare />,
    FaReact: <FaReact />,
    FaSyncAlt: <FaSyncAlt />,
    LuFileJson2: <LuFileJson2 />,
    SiSemanticuireact: <SiSemanticuireact />,
    FaGears: <FaGears />,
    GrNotes: <GrNotes />,
    CgIfDesign: <CgIfDesign />,
    MdEngineering: <MdEngineering />,
    GrDocumentTest: <GrDocumentTest />,
    GrConfigure: <GrConfigure />,
    FaRandom: <FaRandom />,
    TbLogicXor: <TbLogicXor />,
    MdSpeed: <MdSpeed />,
    FaShapes: <FaShapes />,
    MdOutlineMemory: <MdOutlineMemory />,
    PiFloppyDiskBold: <PiFloppyDiskBold />,
    GrSatellite: <GrSatellite />,
    TfiWrite: <TfiWrite />,
    LuBinary: <LuBinary />,
    AiOutlineException: <AiOutlineException />,
    MdOutlineWifiPassword: <MdOutlineWifiPassword />,
    TbCloudNetwork: <TbCloudNetwork />,
    BsHddStack: <BsHddStack />,
    LuRouter: <LuRouter />,
    IoMdPaper: <IoMdPaper />,
};

export default iconMap