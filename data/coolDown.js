const timeStamps = new Map();

function coolDownChecker(userId, commandName, cooldown) {
  const now = Date.now();

  // If this command is not in the map yet, initialize it
  if (!timeStamps.has(commandName)) {
    timeStamps.set(commandName, new Map());
  }

  const userTimestamps = timeStamps.get(commandName);

  if (userTimestamps.has(userId)) {
    const lastTime = userTimestamps.get(userId);
    const timePassed = now - lastTime;

    if (timePassed < cooldown) {
      // Still under cooldown
      return cooldown - timePassed;
    }
  }

  // Not under cooldown or expired -> reset timestamp and allow
  userTimestamps.set(userId, now);
  return 0; // Not under cooldown
}

module.exports = coolDownChecker;
