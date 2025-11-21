import { useEffect } from "react";
import Mark from "mark.js";
import { useLocation } from "react-router-dom";
export default function useMarkText() {
  const location = useLocation();
  useEffect(() => {
    const input = document.querySelector("#highlight-input");
    const target = document.querySelector("#pages");
    if (!input) return;

    const markInstance = new Mark(target);

    const markOptions = {
      exclude: [".no-highlight"],
      separateWordSearch: false,
    };
    let timer;
    const handleInput = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const keyword = input.value.trim();
        // remove previous marks first, then mark new ones
        markInstance.unmark({
          done: () => {
            if (keyword) {
              markInstance.mark(keyword, markOptions);
            }
          },
        });
      }, 200);
    };

    input.addEventListener("input", handleInput);
    input.addEventListener("click", handleInput);

    handleInput();

    return () => {
      input.removeEventListener("input", handleInput);
      input.removeEventListener("click", handleInput);
    };
  }, [location.pathname]);

  return null;
}
