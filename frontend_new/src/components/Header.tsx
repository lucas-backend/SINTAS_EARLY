import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import XPadding from "./XPadding";
import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  backLink?: string;
}

export default function Header({ title, backLink }: Props) {
  const navigate = useNavigate();

  function handleBack() {
    if (backLink) navigate(backLink);
    else navigate(-1);
  }

  return (
    <div className="bg-blue-500 text-white py-8">
      <XPadding>
        <div className="relative flex justify-center items-center">
          {/* Back Button */}
          <button
            type="button"
            aria-label="Kembali"
            className="absolute left-0"
            onClick={handleBack}
          >
            <ArrowBackRoundedIcon className="w-6! h-6!" />
          </button>

          {/* Title */}
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
      </XPadding>
    </div>
  );
}
