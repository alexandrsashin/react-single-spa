export interface RootProps {
  name?: string;
}

export default function Root(props: RootProps) {
  const appName = props.name || "Auth Microfrontend";

  return (
    <section style={{ padding: "20px" }}>
      <h2>{appName} is mounted!</h2>
      <div
        style={{
          background: "#f0f8ff",
          padding: "15px",
          borderRadius: "5px",
          border: "1px solid #007acc",
          marginTop: "20px",
        }}
      >
        <h3>🚀 Welcome to Auth Microfrontend</h3>
        <p>
          This is a standalone development version of the auth microfrontend.
        </p>
        <p>Available features:</p>
        <ul>
          <li>✅ Standalone development mode</li>
          <li>✅ Hot reload support</li>
          <li>✅ React 19 support</li>
          <li>✅ TypeScript support</li>
        </ul>

        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#e8f5e8",
            borderRadius: "4px",
          }}
        >
          <strong>Development URLs:</strong>
          <ul style={{ marginTop: "10px" }}>
            <li>
              Standalone: <code>http://localhost:8080</code>
            </li>
            <li>
              In root app: <code>http://localhost:9000</code> (if root-config is
              running)
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
