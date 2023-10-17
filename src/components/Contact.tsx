const Contact = () => {
  return (
    <section className="bg-[#f8f8f8fb] py-[calc(4vw_+_3rem)] px-[calc(4vw_+_3rem)] text-[#4831d4] flex flex-col justify-center items-center">
      <h3 className="text-[3.4rem] font-semibold leading-none">Send me a message!</h3>
      <p className="text-lg leading-none pt-4 text-black">
        Got a question or proposal, or just want to say hello? Go ahead.
      </p>
      <span className="block w-[30%] bg-[#4831d4] h-[4px] mx-[auto] mt-4 rounded-sm"></span>

      <form className="mt-6 flex flex-col justify-center items-center w-[70%]">
        <fieldset className="flex justify-between items-center gap-[4rem] w-full">
          <div className="flex flex-col justify-center items-center w-full">
            <label htmlFor="name" className="self-start">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
              className="w-full p-4 mt-2 bg-transparent border-b-[2px] border-b-[#4831d4] border-solid transition-all"
            />
          </div>

          <div className="flex flex-col justify-center items-center w-full">
            <label htmlFor="name" className="self-start">
              Your email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email address"
              className="w-full p-4 mt-2 bg-transparent border-b-[2px] border-b-[#4831d4] border-solid transition-all  focus:border-none"
            />
          </div>
        </fieldset>
        <fieldset>
          <textarea
            name="message"
            id="message"
            placeholder="Hi, I think we need a design system for our products at Company X. How soon can you hop on to discuss this?
"
          ></textarea>
        </fieldset>

        <button type="submit" className="btn41-44 btn-42 text-center">
          SHOOT
        </button>
      </form>
    </section>
  );
};

export default Contact;
