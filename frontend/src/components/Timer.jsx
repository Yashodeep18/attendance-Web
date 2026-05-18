import { useEffect, useState } from "react";
import { calculateWorkedSecondsExcludingLunch, formatSecondsToHHMMSS } from "../utils/formatTime";

const Timer = ({ clockInTime, clockOutTime, lunchStartTime, lunchEndTime, onTick }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const update = () => {
      const calculatedSeconds = calculateWorkedSecondsExcludingLunch({
        clockInTime,
        endTime: clockOutTime || new Date(),
        lunchStartTime,
        lunchEndTime,
      });
      setSeconds(calculatedSeconds);
      onTick?.(calculatedSeconds);
    };

    update();

    if (clockOutTime) return undefined;

    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, [clockInTime, clockOutTime, lunchStartTime, lunchEndTime]);

  return <span className="font-mono text-2xl font-bold">{formatSecondsToHHMMSS(seconds)}</span>;
};

export default Timer;
