import "./index.css";
import React, {
  Fragment,
  useEffect,
  useState,
  KeyboardEvent,
  useRef,
} from "react";
import { Transition } from "@headlessui/react";
import { GiBattery75 } from "react-icons/gi";
import { FaVolumeOff } from "react-icons/fa6";
import { IoRadioSharp } from "react-icons/io5";
import { HiOutlineSignalSlash } from "react-icons/hi2";
import {
  BsChevronLeft,
  BsChevronRight,
  BsFillCircleFill,
  BsPalette,
  BsSun,
  BsVolumeMute,
  BsVolumeUp,
} from "react-icons/bs";
import { BiLink, BiMoon } from "react-icons/bi";
import { isEnvBrowser } from "../../utils/misc";
import radioSrcGreen from "../../assets/images/_radio.png";
import radioSrcWhite from "../../assets/images/_radio2.png";
import radioSrCyan from "../../assets/images/_radio3.png";
import { useNuiEvent } from "../../hooks/useNuiEvent";
import { useVisibility } from "../../hooks/useVisibility";
import { fetchNui } from "../../utils/fetchNui";
import BootAnimation from "../BootAnimation";
import { useTheme } from "../../hooks/useTheme";
import Button from "../Button";
import JammerHud from "../JammerHud";

type PlayerOnRadioType = {
  source: number;
  name: string;
  isMuted: boolean;
};

const Radio: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [serverVoiceSystem, setServerVoiceSystem] = useState<string | null>(
    null
  );
  const [gameTime, setGameTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [radioVolume, setRadioVolume] = useState<number>(50);
  const [onRadio, setOnRadio] = useState<boolean>(false);
  const { visible, setVisible } = useVisibility();
  const [playersInRadio, setPlayersInRadio] = useState<
    PlayerOnRadioType[] | null
  >(null);
  const [jammerHud, setJammerHud] = useState<boolean>(false);
  const [radioCase, setRadioCase] = useState<"green" | "white" | "cyan">(
    "white"
  );
  const [changeCaseMenu, setChangeCaseMenu] = useState<boolean>(false);

  useEffect(() => {
    fetchNui<string>("getServerVoiceSystem").then((data) => {
      setServerVoiceSystem(data);
    });
  }, []);

  useNuiEvent<boolean>("setRadioVisible", (value) => {
    setChangeCaseMenu(false);
    setVisible(value);
  });

  useNuiEvent<boolean>("setJammerHud", (value) => {
    if (jammerHud == value) return;
    setJammerHud(value);
  });

  useNuiEvent<boolean>("resetRadio", () => {
    setOnRadio(false);
    setVisible(false);
    setPlayersInRadio(null);
  });

  useNuiEvent<{ hour: string; minute: string }>("setGameTime", (value) => {
    setGameTime(value.hour + ":" + value.minute);
  });

  useNuiEvent<PlayerOnRadioType[]>("setPlayersInRadioChannel", (data) => {
    setPlayersInRadio(data);
  });

  const setRadioChannel = (channel: number) => {
    if (isLoading) return;
    setIsLoading(true);
    fetchNui("joinRadio", channel).then((data) => {
      setIsLoading(false);
      if (data.status) {
        setOnRadio(data.connected);
        setJammerHud(false);
      }
    });
  };

  const leaveChannel = () => {
    if (isLoading) return;
    setIsLoading(true);
    fetchNui("leaveRadio").then((data) => {
      setIsLoading(false);
      if (data.status) {
        setOnRadio(false);
      }
    });
  };

  const handleRadioPower = () => {
    if (isLoading) return;
    setIsLoading(true);
    fetchNui("poweredOff").then(() => {
      setIsLoading(false);
      setOnRadio(false);
    });
  };

  const handleVolumeSet = (type: "volumeUp" | "volumeDown") => {
    if (isLoading) return;
    setIsLoading(true);
    fetchNui(type).then((data) => {
      setIsLoading(false);
      if (data.status) {
        setRadioVolume(data.newVolume);
      }
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const { value } = event.target as HTMLInputElement;
      setRadioChannel(parseInt(value));
    }
  };

  const handleConnect = () => {
    if (inputRef.current) {
      const inputValue = inputRef.current.value;
      setRadioChannel(parseInt(inputValue));
    }
  };

  const handleMutePlayer = (source: number) => {
    const src = source;
    fetchNui("setMutePlayer", source).then(() => {
      setPlayersInRadio((prevPlayers) => {
        return (
          prevPlayers &&
          prevPlayers.map((player) => {
            if (player.source === src) {
              return { ...player, isMuted: !player.isMuted };
            }
            return player;
          })
        );
      });
    });
  };

  return (
    <>
      <Transition
        show={visible}
        as={Fragment}
        enter="transition-all duration-300 ease-out"
        enterFrom="bottom-[-70%] opacity-0"
        enterTo="bottom-[5vh] opacity-1"
        leave="transition-all duration-300 ease-in"
        leaveFrom="bottom-[5vh] opacity-1"
        leaveTo="bottom-[-70%] opacity-0"
      >
        <div className="radio absolute bottom-[5vh] right-[5vh] mx-auto px-3 z-[100]">
          {radioCase === "green" && (
            <img className="w-[25vh]" src={radioSrcGreen} alt="Green Radio" />
          )}
          {radioCase === "white" && (
            <img className="w-[25vh]" src={radioSrcWhite} alt="White Radio" />
          )}
          {radioCase === "cyan" && (
            <img className="w-[25vh]" src={radioSrCyan} alt="Cyan Radio" />
          )}
          {jammerHud && onRadio && <JammerHud />}
          <div className="bottom-[9.4vh] right-[7vh] w-[13.4vh] h-[22.2vh] absolute flex flex-col justify-between overflow-scroll no-scrollbar bg-white dark:bg-gray-900">
            {!isEnvBrowser() && <BootAnimation />}
            <div className="p-1.5 px-1 flex items-center justify-between border-b border-gray-300 dark:border-gray-700">
              <div>
                <div className="flex items-center text-dark-900 dark:text-sky-100">
                  <FaVolumeOff size={13} />
                  <span className="text-[10px]">{radioVolume}%</span>
                </div>
              </div>
              <div className="flex justify-between">
                {!jammerHud ? (
                  <IoRadioSharp
                    className="text-dark-900 dark:text-sky-100 mr-0.5"
                    size={15}
                  />
                ) : (
                  <HiOutlineSignalSlash
                    className="text-dark-900 dark:text-sky-100 mr-0.5"
                    size={15}
                  />
                )}
                <GiBattery75
                  className="max-lg:hidden text-dark-900 dark:text-sky-100 mr-0.5"
                  size={15}
                />
                <span className="max-xl:hidden text-[11px] text-dark-900 dark:text-sky-100">
                  {gameTime}
                </span>
              </div>
            </div>
            <div className="h-full flex flex-col flex-auto justify-between py-0.5 text-white dark:text-sky-100">
              {!onRadio && (
                <div className="flex items-center justify-center py-1">
                  <button
                    onClick={() => {
                      if (inputRef.current) {
                        const currentValue =
                          parseInt(inputRef.current.value) || 0;
                        const newValue = Math.max(currentValue - 1, 0);
                        inputRef.current.value = newValue.toString();
                      }
                    }}
                    className="flex justify-start px-1 py-2 outline-none text-gray-700 dark:text-sky-100"
                  >
                    <BsChevronLeft />
                  </button>
                  <div>
                    <label htmlFor="channelId" className="sr-only">
                      ChannelId
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      id="channelId"
                      className="p-1.5 text-center bg-gray-50 border rounded-sm border-gray-300 text-gray-900 text-sm block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:ring-0 focus:outline-none"
                      placeholder="..."
                      max={9999}
                      maxLength={4}
                      required
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (inputRef.current) {
                        inputRef.current.value = (
                          (parseInt(inputRef.current.value) || 0) + 1
                        ).toString();
                      }
                    }}
                    className="flex justify-end px-1 py-2 outline-none text-gray-700 dark:text-sky-100"
                  >
                    <BsChevronRight />
                  </button>
                </div>
              )}
              {onRadio && (
                <div className="px-1">
                  <div className="mb-0.5 text-black dark:text-sky-100 text-xs font-medium text-center">
                    [Connectors]
                  </div>
                  {playersInRadio && (
                    <div className="w-full h-[9.5vh] no-scrollbar overflow-y-scroll">
                      {playersInRadio.map((player, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-center"
                        >
                          <span
                            className="text-black dark:text-sky-100 text-xs truncate"
                            style={{ maxWidth: "calc(100% - 20px)" }}
                            title={player.name}
                          >
                            {player.name}
                          </span>
                          {serverVoiceSystem === "pma-voice" && (
                            <button
                              className="ml-0.5"
                              onClick={() => {
                                handleMutePlayer(player.source);
                              }}
                            >
                              {index !== 0 &&
                                (player.isMuted ? (
                                  <BsVolumeMute
                                    size={14}
                                    className="text-black dark:text-sky-100 ml-auto"
                                  />
                                ) : (
                                  <BsVolumeUp
                                    size={14}
                                    className="text-black dark:text-sky-100 ml-auto"
                                  />
                                ))}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="w-full flex items-center justify-center my-1">
                {!onRadio && (
                  <button
                    className="w-full mx-1 p-1.5 bg-green-500 hover:bg-green-600 rounded-sm flex items-center justify-center"
                    onClick={handleConnect}
                  >
                    <BiLink className="max-lg:hidden mr-2" size={18} />
                    <span className="text-xs lg:font-medium">Connect</span>
                  </button>
                )}
                {onRadio && (
                  <button
                    className="z-[501] w-full mx-1 p-1.5 bg-red-500 hover:bg-red-600 rounded-sm flex items-center justify-center"
                    onClick={leaveChannel}
                  >
                    <BiLink className="max-lg:hidden mr-2" size={18} />
                    <span className="text-xs lg:font-medium">Disconnect</span>
                  </button>
                )}
              </div>
            </div>
            <div className="px-1.5 border-t border-gray-300 dark:border-gray-700">
              <div className="flex items-center justify-around">
                <button
                  className="py-1.5 border-r border-gray-400 w-full flex justify-center text-black dark:text-sky-100 hover:text-green-700 dark:hover:text-orange-100 outline-none"
                  onClick={() => {
                    setChangeCaseMenu(!changeCaseMenu);
                  }}
                >
                  <BsPalette size={18} />
                </button>
                {theme == "dark" && (
                  <button
                    className="py-1.5 w-full flex justify-center text-sky-100 hover:text-orange-100 outline-none"
                    onClick={() => {
                      setTheme("light");
                    }}
                  >
                    <BsSun size={18} />
                  </button>
                )}
                {theme == "light" && (
                  <button
                    className="py-1.5 w-full flex justify-center text-black hover:text-green-700 outline-none"
                    onClick={() => {
                      setTheme("dark");
                    }}
                  >
                    <BiMoon size={18} />
                  </button>
                )}
              </div>
              <Transition
                show={changeCaseMenu}
                as={Fragment}
                enter="transition-all duration-300 ease-in-out"
                enterFrom="top-[-70%] opacity-0"
                enterTo="top-0 opacity-1"
                leave="transition-all duration-300 ease-in-out"
                leaveFrom="top-0 opacity-1"
                leaveTo="top-[-70%] opacity-0"
              >
                <div className="absolute p-1 top-0 left-0 bg-gray-200 dark:bg-gray-900 w-full shadow-xl border-b border-gray-800">
                  <div className="w-full text-center mb-0.5">
                    <p className="dark:text-white">Change Case</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <button
                        onClick={() => {
                          setRadioCase("cyan");
                        }}
                        className="m-auto flex items-center justify-center p-1 border border-gray-400 dark:border-gray-600 rounded-full hover:border-gray-900 dark:hover:border-white"
                      >
                        <BsFillCircleFill className="text-cyan-600" size={20} />
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setRadioCase("white");
                        }}
                        className="m-auto flex items-center justify-center p-1 border border-gray-400 dark:border-gray-600 rounded-full hover:border-gray-900 dark:hover:border-white"
                      >
                        <BsFillCircleFill className="text-gray-400" size={20} />
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setRadioCase("green");
                        }}
                        className="m-auto flex items-center justify-center p-1 border border-gray-400 dark:border-gray-600 rounded-full hover:border-gray-900 dark:hover:border-white"
                      >
                        <BsFillCircleFill
                          className="text-green-600"
                          size={20}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
          <div className="absolute overflow-hidden bottom-[2.5vh] right-[5.7vh] w-[16.2vh] h-[5vh]">
            <div>
              <Button
                onClick={handleRadioPower}
                rounded="full"
                style={{
                  width: "5vh",
                  height: "2.15vh",
                  left: "5.7vh",
                }}
              />
            </div>
            <div>
              <Button
                onClick={() => {
                  handleVolumeSet("volumeUp");
                }}
                rounded="full"
                style={{
                  bottom: ".2vh",
                  left: ".7vh",
                  width: "3.5vh",
                  height: "3.5vh",
                }}
              />
            </div>
            <div>
              <Button
                onClick={() => {
                  handleVolumeSet("volumeDown");
                }}
                rounded="full"
                style={{
                  bottom: ".2vh",
                  right: ".7vh",
                  width: "3.5vh",
                  height: "3.5vh",
                }}
              />
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
};

export default Radio;
