import { DateTime } from "luxon";

function getUptime() {
  const currentTimePlusUptime = DateTime.now().plus({
    seconds: process.uptime()
  });

  const currentTime = DateTime.now();

  const uptime = currentTimePlusUptime.diff(currentTime, ["years", "months", "days", "hours", "minutes", "seconds"]);

  const uptimeObj = uptime.toObject();

  uptimeObj.seconds = Math.round(uptimeObj.seconds!);
  return uptimeObj;
}

export default getUptime;
