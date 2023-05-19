import { Meetup } from "../db/repositories/meetups";

export type RangeColors = [string, string, string, string, string, string, string]
/**
 * Gets the correct intensity of the color, based on the % of people who can attend
 *
 * @param totalNum The total number of people who have interacted with the calendar // TODO: Check if we need to remove users when they remove all their selections
 * @param amount The number of people who have selected this time slot
 * @returns the correct color in the scale
 */
export const assignColor = (totalNum: number, amount: number, colors: RangeColors) => {
    const percent = amount / totalNum;
    if (percent === 0) {
        return colors[0];
    }
    if (percent < 0.2) {
        return colors[1];
    }
    if (percent < 0.4) {
        return colors[2];
    }
    if (percent < 0.6) {
        return colors[3];
    }
    if (percent < 0.8) {
        return colors[4];
    }
    if (percent < 1) {
        return colors[5];
    }
    return colors[6];
};

/**
 * Checks to see if the next timing has people who selected it.
 *
 * e.g. if the current time is 12:00pm, and the next time is 12:30pm,
 * this function will check if anyone selected 12:30pm
 *
 * If the next time slot is the next day, always return false
 *
 * @param dateTimeStr the current time to check the next date of
 * @returns true if the next time slot has people who selected it
 */
export const hasPeopleInNextTimeSlot = (
    dateTimeStr: string,
    meetup: Meetup
) => {
    const [time, date] = dateTimeStr.split("::");
    const nextTime = parseInt(time) + 30;
    if (parseInt(time) + 30 >= 24 * 60) {
        // it's the next day, ALWAYS render the stop.
        return false;
    }
    const nextDateTimeStr = `${nextTime}::${date}`;
    const stat = meetup.selectionMap[nextDateTimeStr]
        ? meetup.selectionMap[nextDateTimeStr].length > 0
        : false;
    return stat;
};

/**
 * Checks to see if the PREVIOUS timing has the same # of people and the same people in it.
 * If so, we can merge the two time slots together and don't render THIS current time slot.
 *
 * @param dateTimeStr the current time to check the previous date of
 * @returns true if the previous time slot has the same people and the same # of people    *
 *
 */
export const isSameAsPreviousTimeSlot = (dateTimeStr: string, meetup: Meetup) => {
    const [time, date] = dateTimeStr.split("::");
    const prevTime = parseInt(time) - 30;
    if (parseInt(time) < 0) {
        // it's the previous day
        return false;
    }

    const prevDateTimeStr = `${prevTime}::${date}`;
    const curSelected = meetup.selectionMap[dateTimeStr];
    const previousSelected = meetup.selectionMap[prevDateTimeStr];
    if (
        !previousSelected ||
        !curSelected ||
        (previousSelected && previousSelected.length != curSelected.length)
    ) {
        return false;
    }

    // check if the two arrays have the same contents
    const temp: { [key: number]: number } = {};
    curSelected.forEach((user) => (temp[user.id] = 1));
    const isSame = previousSelected.every((user) => temp[user.id] === 1);

    return isSame;
};

/**
 * Checks to see if the NEXT timing has the same # of people and the same people in it.
 * If so, we can merge the two time slots together and don't render THIS current time slot.
 *
 * @param dateTimeStr the current time to check the previous date of
 * @returns true if the previous time slot has the same people and the same # of people    *
 *
 */
export const isSameAsNextTimeSlot = (dateTimeStr: string, meetup: Meetup) => {
    const [time, date] = dateTimeStr.split("::");
    const nextTime = parseInt(time) + 30;
    if (parseInt(time) >= 24 * 60) {
        // it's the previous day
        return false;
    }

    const nextDateTimeStr = `${nextTime}::${date}`;
    const curSelected = meetup.selectionMap[dateTimeStr];
    const nextSelected = meetup.selectionMap[nextDateTimeStr];
    if (
        !nextSelected ||
        !curSelected ||
        (nextSelected && nextSelected.length != curSelected.length)
    ) {
        return false;
    }

    // check if the two arrays have the same contents
    const temp: { [key: number]: number } = {};
    curSelected.forEach((user) => (temp[user.id] = 1));
    const isSame = nextSelected.every((user) => temp[user.id] === 1);

    return isSame;
};

/**
 * Checks to see how many of the next time slots have the same # of people and the same people in it.
 *
 * Stops counting at midnight.
 *
 * @param dateTimeStr the current date and time to check
 * @returns An array [0, 1, ..., n-1] where n and
 * length is equal to the number of consecutive time slots that have the same # of people and the same people in it.
 */
export const getNumberOfConsectiveSelectedTimeSlots = (
    dateTimeStr: string,
    meetup: Meetup
) => {
    const [time, date] = dateTimeStr.split("::");
    let nextTime = parseInt(time) + 30;
    let count = 0;
    while (true) {
        if (nextTime >= 24 * 60) {
            // it's the next day, we stop counting here
            break;
        }
        if (isSameAsPreviousTimeSlot(`${nextTime}::${date}`, meetup)) {
            count++;
            nextTime += 30;
        } else {
            break;
        }
    }
    return Array.from(Array(count).keys());
};
