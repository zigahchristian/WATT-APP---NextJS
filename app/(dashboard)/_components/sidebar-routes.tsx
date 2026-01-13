"use client";

import { Layout, Calendar } from "lucide-react";
import SidebarItem from "./sidebar-item";

const guestRoutes = [
  {
    label: "Dashboard",
    icon: Layout,
    href: "/students",
  },
  {
    label: "TimeTable",
    icon: Calendar,
    href: "/timetable",
  },
];

const SidebarRoutes = () => {
  const routes = guestRoutes;
  return (
    <div className="flex flex-col w-full">
      {routes.map((item) => (
        <SidebarItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
        />
      ))}
    </div>
  );
};

export default SidebarRoutes;
