const HamburgerMenu = ({ toggled }: any) => {
  return (
    <div className="w-[3rem] h-[2rem] flex items-center z-[100] flex-col py-1 justify-between relative my-4">
      <div
        className={`w-[3rem] h-[0.25rem] rounded-[10px] transition-all bg-[#4831d4] origin-[1px] ${
          toggled ? "rotate-0" : "rotate-0"
        }`}
      ></div>
      <div
        className={`w-[2rem] h-[0.25rem] rounded-[10px] transition-all bg-[#4831d4] origin-[1px] ${
          toggled ? "translate-x-[100%] opacity-0" : "translate-x-0 opacity-100"
        }`}
      ></div>
      <div
        className={`w-[3rem] h-[0.25rem] rounded-[10px] transition-all bg-[#4831d4] origin-[1px] ${
          toggled ? "rotate-[-90deg]" : "rotate-0"
        }`}
      ></div>
    </div>
  );
};

export default HamburgerMenu;
