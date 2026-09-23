import type { JadwalItem } from "../../../../types/jadwal";
import JadwalCard from "./JadwalCard";

interface Props {
  title: string;
  items: readonly JadwalItem[];
}

export default function JadwalSection({ title, items }: Props) {
  return (
    <section className="mt-4">
      <h3 className="text-xl font-semibold">{title}</h3>

      <div className="mt-4 flex flex-col gap-4">
        {items.map((item) => (
          <JadwalCard key={`${item.name}-${item.time}`} item={item} />
        ))}
      </div>
    </section>
  );
}
