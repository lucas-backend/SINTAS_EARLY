import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import Button from "../../components/Button";
import XPadding from "../../components/XPadding";
import { useNavigate } from "react-router-dom";

const appName = "Kak Lia";

export default function Login() {
  const navigate = useNavigate();

  function handleFormSubmit() {
    // Sementara langsung diarahin ke dashboard dulu
    navigate("/dashboard");
  }
  return (
    <div className="bg-blue-500 h-dvh text-white flex items-center pb-32">
      <XPadding>
        {/* Icon & Title */}
        <div className="text-center">
          <MenuBookRoundedIcon className="h-16! w-16!" />
          <h1 className="text-6xl font-bold">{appName}</h1>
        </div>

        <form
          className="flex flex-col items-center gap-4 mt-12"
          onSubmit={handleFormSubmit}
        >
          <span className="font-semibold text-2xl">Masuk</span>
          <input
            type="text"
            placeholder="Username"
            className="text-black bg-white w-full px-4 py-2 focus:outline-none rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            className="text-black bg-white w-full px-4 py-2 focus:outline-none rounded-lg"
          />
          <Button type="submit" className="bg-orange-400">
            MASUK
          </Button>
        </form>
      </XPadding>
    </div>
  );
}
