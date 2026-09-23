import XPadding from "../components/XPadding";

export default function NotFound() {
  return (
    <div className="bg-blue-500 h-dvh">
      <XPadding className="h-full flex flex-col justify-center items-center text-white">
        <h1 className="text-2xl font-bold text-center">Page Not Found</h1>
        <p className="font-bold text-2xl">404</p>
      </XPadding>
    </div>
  );
}
