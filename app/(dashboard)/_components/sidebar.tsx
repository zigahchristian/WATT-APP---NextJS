import SidebarRoutes from "./sidebar-routes";
import logo from "../../../public/watt.png";
import Image from "next/image";

const Sidebar = () => {
  return (
    <div className="h-full border-r flex  flex-col  overflow-y-auto bg-white shadow-sm">
      <div className="p-6">
        <Image src={logo} alt="Logo" width={500} />
      </div>
      <div className="flex flex-col w-full">
        <SidebarRoutes />
      </div>
    </div>
  );
};

export default Sidebar;
