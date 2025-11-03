import { useEffect } from "react";
import Mark from "mark.js";

export default function useMarkText() {
  useEffect(() => {
    const input = document.querySelector("#highlight-input");
    const markInstance = new Mark(document.body);

    if (!input) return;

    const handleInput = () => {
      const keyword = input.value;
      markInstance.unmark({
        done: () => {
          if (keyword.trim()) {
            markInstance.mark(keyword);
          }
        },
      });
    };

    input.addEventListener("input", handleInput);

    return () => {
      input.removeEventListener("input", handleInput);
    };
  }, []);
}
