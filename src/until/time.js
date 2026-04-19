export const formatTime = (dateString) => {
  const date = new Date(dateString);

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
export const formatDateLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.toDateString() === d2.toDateString();

  if (isSameDay(date, today)) return "Hôm nay";
  if (isSameDay(date, yesterday)) return "Hôm qua";

  return date.toLocaleDateString("vi-VN");
};