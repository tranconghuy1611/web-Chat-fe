export default function Avatar({ name = "A" }) {
  return (
    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}