export function sampleEvent() {
  const date = new Date();
  date.setDate(date.getDate() + 10);
  date.setHours(19, 0, 0, 0);
  const deadline = new Date(date);
  deadline.setDate(deadline.getDate() - 3);
  return {
    title: "Dinner at mine",
    hostName: "Alex",
    description:
      "A small dinner, something warm, and time to catch up. I’ll make the food; just bring yourself.",
    location: "Alex’s kitchen · 24 Garden Street",
    startsAt: date.toISOString(),
    deadline: deadline.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    deadlineReason: "So I can plan the groceries.",
  };
}
export const sampleGuest = {
  guestName: "Jamie",
  personalNote:
    "It’s been too long. I’d love to have you over — there’s a seat at the table with your name on it.",
};
