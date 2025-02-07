// import { Link, useLocation } from 'react-router-dom';
// import { data } from './data';

// export function SidebarItems() {
//   const { pathname } = useLocation();
//   return (
//     <ul className="">
//       {data.map((item) => (
//         <li key={item.title}>
//           <Link to={item.link}>
//             <span className="flex items-center justify-start my-1 p-3 w-full text-zinc-900 hover:text-black dark:hover:text-black">
//               <div
//                 className={`p-2 px-3 ${item.link === pathname ? 'bg-[rgb(239,239,241)]' : ''} hover:bg-[rgb(239,239,241)] rounded-xl transition-colors duration-300`}
//               >
//                 <span>{item.icon}</span>
//               </div>
//             </span>
//           </Link>
//         </li>
//       ))}
//     </ul>
//   );
// }
