import { useEffect } from "react";
import Mark from "mark.js";

export default function useMarkText() {
  useEffect(() => {
    const input = document.querySelector("#highlight-input");
    if (!input) return;

    const markInstance = new Mark(document.body);

    const handleInput = () => {
      const keyword = input.value.trim();
      markInstance.unmark({
        done: () => {
          if (keyword) {
            markInstance.mark(keyword);
          }
        },
      });
    };

    input.addEventListener("input", handleInput);
    input.addEventListener("click", handleInput);

    handleInput(); // run once on load

    // cleanup listener
    return () => {
      input.removeEventListener("input", handleInput);
    };
  }, []);

  return null; // nothing visible, just runs globally
}
