import {Menu } from "lucide-react";
import Sidebar from "./sidebar";

import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import NavbarRoutes from "@/components/navbar-routes";

const MobileSidebar = () => {
    return (  
        <div className="md:hidden h-[80px] w-full border-b flex items-center px-6 bg-white shadow-sm fixed inset-x-0 top-0 z-50">
            <Sheet>
                <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
                    <Menu />
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 border-r">
                    <Sidebar />
                </SheetContent>
            </Sheet>
            <NavbarRoutes/>
        </div>
    );
}
 
export default MobileSidebar;