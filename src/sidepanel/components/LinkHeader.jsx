import { useLocation, NavLink } from "react-router-dom";
const LinkHeader = () => {
  return (
    <div className=" sticky top-9 z-50 bg-white text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700 ">
      <ul className="flex flex-wrap -mb-px  ">
        <li className="">
          <NavLink
            to="/links"
            aria-current="page"
            className={({ isActive }) =>
              `inline-block p-2       ${
                isActive
                  ? "text-yellow-500 bg-gray-100  dark:text-blue-500"
                  : "inline-block p-2  hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`
            }
          >
            All Links
          </NavLink>
        </li>
        <li className="">
          <NavLink
            to="/broken-links"
            aria-current="page"
            className={({ isActive }) =>
              `inline-block p-2       ${
                isActive
                  ? "text-yellow-500 bg-gray-100  dark:text-blue-500"
                  : "inline-block p-2  hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`
            }
          >
            Broken Links
          </NavLink>
        </li>
        <li className="">
          <NavLink
            to="/target-section"
            aria-current="page"
            className={({ isActive }) =>
              `inline-block p-2       ${
                isActive
                  ? "text-yellow-500 bg-gray-100  dark:text-blue-500"
                  : "inline-block p-2  hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`
            }
          >
            Target Section
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default LinkHeader;
