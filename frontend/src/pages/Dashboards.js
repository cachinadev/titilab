import React from "react";

function Dashboards() {
  return (
    <div>
      <h1>IoT Dashboards</h1>
      <iframe
        src="http://167.99.7.121:3000/d/tu_dashboard_id"
        style={{ width: "100%", height: "800px", border: "none" }}
        title="Grafana Dashboard"
      ></iframe>
    </div>
  );
}

export default Dashboards;
