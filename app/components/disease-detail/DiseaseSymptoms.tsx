type Props = {
  title?: string;
  items: string[];
  className?: string;
};

export default function DiseaseSymptoms({
  title = "อาการของโรค",
  items,
  className = "",
}: Props) {
  if (!items?.length) return null;
  return (
    <section className={`rounded-2xl bg-blue-50 p-4 shadow-sm ${className}`}>
      <h3 className="mb-2 text-lg font-bold text-blue-900">{title}</h3>
      <ul className="list-disc space-y-1 pl-6 text-sm text-gray-800">
        {items.map((t, i) => (
          <li key={`${t}-${i}`}>{t}</li>
        ))}
      </ul>
    </section>
  );
}
