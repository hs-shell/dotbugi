import { Link, useLocation } from 'react-router-dom';
import { data } from './data';
import { useDashboardContext } from '../Provider';

export function SidebarItems() {
  const { pathname } = useLocation();
  const { sidebarOpen } = useDashboardContext();
  return (
    <ul className="md:pl-3">
      {data.map((item) => (
        <li key={item.title}>
          <Link to={item.link}>
            <span className="flex items-center justify-start my-1 p-3 w-full text-zinc-900 hover:text-black dark:hover:text-black">
              <div
                className={`p-2 px-3 ${item.link === pathname ? 'bg-[rgb(239,239,241)]' : ''} hover:bg-[rgb(239,239,241)] rounded-xl transition-colors duration-300`}
              >
                <span>{item.icon}</span>
              </div>
              <span
                className={`mx-4 text-sm whitespace-pre ${
                  sidebarOpen
                    ? 'lg:duration-500 lg:ease-in lg:h-auto lg:opacity-100 lg:transition-all lg:w-auto'
                    : 'lg:duration-700 lg:ease-out lg:invisible lg:opacity-0 lg:transition-all'
                }`}
              >
                {item.title}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
