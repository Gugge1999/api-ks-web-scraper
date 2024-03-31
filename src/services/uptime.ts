import { DateTime } from "luxon";

function getUptime() {
  const currentTimePlusUptime = DateTime.now().plus({
    seconds: process.uptime()
  });

  const currentTime = DateTime.now();

  const uptime = currentTimePlusUptime.diff(currentTime, ["years", "months", "days", "hours", "minutes", "seconds"]);

  return uptime.toObject();
}

export default getUptime;
