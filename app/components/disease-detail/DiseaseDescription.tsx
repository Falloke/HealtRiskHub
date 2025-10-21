type Props = {
  title?: string;
  description?: string | null;
  className?: string;
};

export default function DiseaseDescription({
  title = "คำอธิบายโรค",
  description,
  className = "",
}: Props) {
  if (!description) return null;
  return (
    <section className={`rounded-2xl bg-blue-50 p-4 shadow-sm ${className}`}>
      <h3 className="mb-2 text-lg font-bold text-blue-900">{title}</h3>
      <p className="text-sm leading-6 text-gray-800">{description}</p>
    </section>
  );
}
