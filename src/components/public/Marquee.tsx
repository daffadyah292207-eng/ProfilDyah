export function Marquee() {
  const items = [
    "Muskuloskeletal",
    "Neurologi",
    "Geriatri",
    "Olahraga",
    "Pediatri",
    "Kardiopulmonal",
    "Kesehatan Komunitas",
  ];
  const row = [...items, ...items];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((group) => (
          <div className="flex shrink-0" key={group}>
            {row.map((item, index) => (
              <span className="marquee-item" key={`${group}-${item}-${index}`}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
