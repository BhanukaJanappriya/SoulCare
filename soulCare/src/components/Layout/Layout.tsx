import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-full relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-[477px] h-[283px] -mt-[85px] ml-[1049px] z-20"
        style={{
          backgroundImage: `url(${
            import.meta.env.BASE_URL
          }images/top-right-background.svg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Sidebar />

      <div className="flex-1 flex flex-col ml-20">
        <Header />
        <main className="flex-1 p-10 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
