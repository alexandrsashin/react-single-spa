import { createRoot, type Root } from "react-dom/client";
import { Result, Button } from "antd";
import { useState, useEffect } from "react";

let reactRoot: Root | null = null;
let setRouteFn: ((r: string) => void) | null = null;

function NotFoundApp({
  initialRoute,
  onClose,
}: {
  initialRoute: string;
  onClose?: () => void;
}) {
  const [route, setRoute] = useState(initialRoute);

  useEffect(() => {
    setRouteFn = setRoute;
    return () => {
      if (setRouteFn === setRoute) setRouteFn = null;
    };
  }, [setRoute]);

  const handleBack = () => {
    if (typeof onClose === "function") onClose();
    window.history.pushState(null, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <Result
      status={404}
      title="404"
      subTitle={`Страница ${route} не найдена или недоступна.`}
      extra={
        <Button type="primary" onClick={handleBack}>
          На главную
        </Button>
      }
    />
  );
}

export function renderNotFound(
  container: HTMLElement,
  route: string,
  onClose?: () => void
) {
  if (!container) return;
  if (!reactRoot) {
    reactRoot = createRoot(container);
    reactRoot.render(<NotFoundApp initialRoute={route} onClose={onClose} />);
    return;
  }

  // If mounted, update route via setter to avoid remount
  if (setRouteFn) setRouteFn(route);
}

export function updateNotFound(route: string) {
  if (setRouteFn) setRouteFn(route);
}

export function unmountNotFound() {
  if (reactRoot) {
    try {
      reactRoot.unmount();
    } catch {
      // ignore
    }
    reactRoot = null;
    setRouteFn = null;
  }
}
