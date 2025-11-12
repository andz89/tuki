import { useState } from "react";

export default function CustomContextMenu() {
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault(); // prevent default browser menu
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleClick = () => setShowMenu(false);

  const handleAction = (action) => {
    alert(`You clicked ${action}`);
    setShowMenu(false);
  };

  return (
    <div
      className="relative w-full h-full"
      onClick={handleClick} // hide menu on click anywhere
      style={{ minHeight: "100vh" }}
    >
      <p onContextMenu={handleContextMenu}>Right-click on this paragraph!</p>
      <div onContextMenu={handleContextMenu}>
        Or right-click anywhere in this container.
      </div>

      {/* Floating menu */}
      {showMenu && (
        <div
          style={{
            position: "absolute",
            top: menuPos.y,
            left: menuPos.x,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 1000,
            width: 160,
          }}
        >
          <div
            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
            onClick={() => handleAction("Action 1")}
          >
            Action 1
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
            onClick={() => handleAction("Action 2")}
          >
            Action 2
          </div>
        </div>
      )}
    </div>
  );
}
