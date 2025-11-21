export default function Button({
  text = "Button",
  bgColor = "bg-blue-600",
  hoverBgColor = "hover:bg-blue-500",
  onClick = () => {},
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-center my-2 px-4 py-2 text-white rounded text-sm font-medium no-highlight w-full 
        ${bgColor}
        ${disabled ? "bg-slate-600" : hoverBgColor}
        ${disabled ? "bg-slate-600 cursor-not-allowed" : "cursor-pointer "} 
     `}
    >
      {text}
    </button>
  );
}
