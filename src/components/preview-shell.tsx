"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { BatteryFull, Monitor, Signal, Smartphone, Wifi } from "lucide-react";

const deviceWidth = 422; // 402pt display plus the decorative bezel.
const deviceHeight = 894; // 874pt display plus the decorative bezel.

const storageKey = "gather-preview-mode";
const changeEvent = "gather-preview-change";
let fallbackPhone = false;
function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(changeEvent, notify);
  };
}
function snapshot() {
  try {
    return (
      (localStorage.getItem(storageKey) ??
        (fallbackPhone ? "phone" : "desktop")) === "phone"
    );
  } catch {
    return fallbackPhone;
  }
}
function serverSnapshot() {
  return false;
}
function setMode(phone: boolean) {
  fallbackPhone = phone;
  try {
    localStorage.setItem(storageKey, phone ? "phone" : "desktop");
  } catch {
    /* Preview still works when browser storage is disabled. */
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function PreviewShell({ children }: { children: ReactNode }) {
  const phone = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const pathname = usePathname();
  const viewport = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const fit = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!phone || !stage.current || !fit.current) return;
    const measure = () => {
      if (!stage.current || !fit.current) return;
      const styles = getComputedStyle(stage.current);
      const width =
        stage.current.clientWidth -
        parseFloat(styles.paddingLeft) -
        parseFloat(styles.paddingRight);
      const height =
        window.innerHeight -
        (fit.current.getBoundingClientRect().top + window.scrollY) -
        parseFloat(styles.paddingBottom);
      setScale(
        Math.max(0.1, Math.min(1, width / deviceWidth, height / deviceHeight)),
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage.current);
    const toolbar = stage.current.previousElementSibling;
    if (toolbar) observer.observe(toolbar);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [phone]);
  const context = pathname.startsWith("/i/") ? "Guest invitation" : "Host app";

  useEffect(() => {
    viewport.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, phone]);

  return (
    <div className="preview-shell" data-preview={phone ? "phone" : "desktop"}>
      <div className="preview-toolbar" aria-label="Prototype controls">
        <div className="preview-title">
          <span className="preview-dot" aria-hidden="true" />
          <span>Prototype preview</span>
          <span className="preview-context">{context}</span>
        </div>
        <div className="preview-switch" role="group" aria-label="Preview mode">
          <button
            type="button"
            aria-pressed={!phone}
            onClick={() => setMode(false)}
          >
            <Monitor size={16} aria-hidden="true" />
            Desktop
          </button>
          <button
            type="button"
            aria-pressed={phone}
            onClick={() => setMode(true)}
          >
            <Smartphone size={16} aria-hidden="true" />
            Phone
          </button>
        </div>
      </div>
      <div className="preview-stage" ref={stage}>
        <div className="preview-caption" aria-live="polite">
          <strong>{context} preview</strong>
          <span>iPhone 17 · 402 × 874 pt</span>
        </div>
        <div
          className="device-fit"
          ref={fit}
          style={
            {
              "--device-width": `${deviceWidth}px`,
              "--device-height": `${deviceHeight}px`,
              "--device-scale": scale,
            } as CSSProperties
          }
        >
          <div className="device-frame">
            <div className="device-status" aria-hidden="true">
              <span>9:41</span>
              <span className="device-island" />
              <span className="device-signals">
                <Signal size={15} />
                <Wifi size={16} />
                <BatteryFull size={21} />
              </span>
            </div>
            <div id="app-viewport" className="app-viewport" ref={viewport}>
              {children}
            </div>
            <div className="device-home" aria-hidden="true">
              <span />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
