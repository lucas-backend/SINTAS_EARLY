import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="bg-white pl-3 pr-5 py-2 pb-2.5 rounded-full text-black/50 relative z-10 border border-black/10 flex items-center">
      <SearchRoundedIcon className="w-6! h-6! flex justify-center items-center" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Cari Fitur"
        className="text-black focus:outline-none ml-2 flex-1 bg-transparent"
      />
    </div>
  );
}