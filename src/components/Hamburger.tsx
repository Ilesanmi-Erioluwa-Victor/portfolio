const HamburgerMenu = () => {
  return (
    <div className="w-[3rem] h-[3rem] flex justify-around z-50 flex-col ml-5">
      <div className="w-[2rem] h-[0.25rem] rounded-[10px] transition-all bg-black origin-[1px]"></div>
      <div className="w-[2rem] h-[0.25rem] rounded-[10px] transition-all bg-black origin-[1px]"></div>
      <div className="w-[2rem] h-[0.25rem] rounded-[10px] transition-all bg-black origin-[1px]"></div>
    </div>
  );
};

export default HamburgerMenu;
