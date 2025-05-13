import { FC } from "react";
import noSignalGif from "../../assets/images/no-signal.gif";

const JammerHud: FC = () => {
  return (
    <>
      <div className="z-[500] bottom-[9.4vh] right-[7vh] w-[13.4vh] h-[19.5vh] absolute overflow-hidden">
        <img src={noSignalGif} alt="no-signal" className="w-full h-full" />
        <div className="absolute top-[20%] w-full text-center bg-gray-900 p-1 font-medium text-white text-lg">
          <span>No Signal</span>
        </div>
      </div>
    </>
  );
};

export default JammerHud;
