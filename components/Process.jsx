export default function Process() {
  return (
    <div className="process">
      <div className="process-head">
        <p className="process-label txt">My Process</p>
        <p className="lede txt">
          Four steps between a vague idea and something people actually use.
          Anyone can start at the screen, the harder part is knowing what the
          screen is supposed to solve, for whom, and why now. That question
          shapes everything downstream, so it&rsquo;s the one I start with.
        </p>
      </div>

      <div className="steps">
        <div className="steps-inner">
          <div className="step">
            <span className="step-id">
              <span className="step-n txt">01</span>
              <span className="step-t txt">Understand</span>
            </span>
            <span className="step-d txt">
              I start with the business goal, not the screen.
            </span>
          </div>
          <hr />
          <div className="step">
            <span className="step-id">
              <span className="step-n txt">02</span>
              <span className="step-t txt">Structure</span>
            </span>
            <span className="step-d txt">
              Flows, states, and edge cases before pixels.
            </span>
          </div>
          <hr />
          <div className="step">
            <span className="step-id">
              <span className="step-n txt">03</span>
              <span className="step-t txt">Design</span>
            </span>
            <span className="step-d txt">
              High-fidelity UI with a system behind it.
            </span>
          </div>
          <hr />
          <div className="step">
            <span className="step-id">
              <span className="step-n txt">04</span>
              <span className="step-t txt">Ship</span>
            </span>
            <span className="step-d txt">
              I build Landing pages, front-end handoff.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
