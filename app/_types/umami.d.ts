type EventName = "tag-click";

interface Window {
  umami?: {
    track: (eventName: EventName, data?: Record<string, string | number | boolean>) => void;
  };
}
