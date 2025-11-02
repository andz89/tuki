import { useEffect, useState } from "react";

export default function AlertBox({ message, type = "info", duration }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);

      // Only auto-hide if duration is provided
      if (duration) {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
      }
    }
  }, [message, duration]);

  if (!visible || !message) return null;

  const styles = {
    base: "px-2 py-2 rounded-lg shadow-lg mb-2 text-sm font-medium transition-all duration-300",
    types: {
      success: "bg-green-50 text-green-800 border border-green-300",
      error: "bg-red-50 text-red-800 border border-red-300",
      info: "bg-blue-50 text-blue-800 border border-blue-300",
      warning: "bg-yellow-50 text-yellow-800 border border-yellow-300",
    },
  };

  return (
    <div className={`${styles.base} ${styles.types[type]}`}>{message}</div>
  );
}
