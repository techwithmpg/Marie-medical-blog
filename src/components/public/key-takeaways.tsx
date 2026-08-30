import { Check, Stethoscope } from "lucide-react";

interface KeyTakeawaysProps {
  items: string[];
}

export function KeyTakeaways({ items }: KeyTakeawaysProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <aside
      aria-labelledby="key-takeaways-title"
      className="overflow-hidden rounded-lg border border-[#E4D7C7] bg-[linear-gradient(145deg,#F8EEE2_0%,#F3E5D3_100%)] p-5"
    >
      <div className="flex items-center gap-3">
        <Stethoscope
          aria-hidden="true"
          strokeWidth={1.5}
          className="text-brand-oxide h-7 w-7 shrink-0"
        />

        <h2
          id="key-takeaways-title"
          className="font-serif text-lg font-medium text-ink"
        >
          Key Takeaways
        </h2>
      </div>

      <ul className="mt-5 space-y-4">
        {items.map((item, index) => (
          <li key={`${index}-${item}`} className="flex items-start gap-2.5">
            <Check
              aria-hidden="true"
              strokeWidth={2}
              className="text-brand-oxide mt-[2px] h-4 w-4 shrink-0"
            />

            <span className="text-[0.74rem] leading-[1.45] text-[#45413D]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
