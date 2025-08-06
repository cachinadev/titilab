import React from "react";

function Dashboards() {
  return (
    <div>
      <h1>IoT Dashboards</h1>
      <iframe
        src="http://167.99.7.121:3000/d/public-dashboards/3ea471d0858e417e8d084a5e4afda37e?refresh=auto&from=2025-07-06T17:24:07.219Z&to=2025-07-07T03:10:55.219Z&timezone=browser"
        style={{ width: "100%", height: "800px", border: "none" }}
        title="Grafana Dashboard"
      ></iframe>
    </div>
  );
}

export default Dashboards;
