export default function ScaleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Corpo da balança (mais ajustado) */}
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />

      {/* Visor central */}
      <rect x="8" y="5" width="8" height="4" rx="1" />

      {/* Indicador */}
      <path d="M12 9v2" />
      <circle cx="12" cy="13" r="1" />
    </svg>
  );
}
