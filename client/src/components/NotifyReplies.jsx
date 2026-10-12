import { useReplyNotifications } from "../push";

// "Notify me when someone replies", for a letter you wrote.
export default function NotifyReplies({ letterId, className }) {
  var n = useReplyNotifications(letterId);
  var wrap = "text-sm " + (className || "");

  if (n.state === "hidden") return null;
  if (n.state === "ios-install") {
    return <p className={wrap + " text-ink-faint"}>To get a notification when someone replies on iPhone, add this site to your Home Screen first: tap Share, then Add to Home Screen.</p>;
  }
  if (n.state === "denied") {
    return <p className={wrap + " text-ink-faint"}>Notifications are blocked for this site. You can allow them in your browser's settings.</p>;
  }
  if (n.state === "on") {
    return (
      <p className={wrap + " text-ink-muted"}>
        We'll send a quiet notification when someone replies.{" "}
        <button onClick={n.turnOff} className="text-ink-faint underline underline-offset-4 hover:text-ink">Turn off</button>
      </p>
    );
  }
  return (
    <div className={wrap}>
      <button onClick={n.turnOn} disabled={n.state === "working"}
        className="px-4 py-2 rounded-full border border-line bg-surface text-ink hover:border-accent/50 transition-colors disabled:opacity-50">
        {n.state === "working" ? "Turning on…" : "Notify me when someone replies"}
      </button>
      {n.state === "error" && <p className="mt-2 text-danger">That didn't work. Try again in a moment.</p>}
    </div>
  );
}
