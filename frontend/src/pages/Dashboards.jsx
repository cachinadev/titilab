// frontend/src/pages/Dashboards.jsx
import React from "react";
import { Container, Typography, Paper } from "@mui/material";

export default function Dashboards() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>📊 Dashboards IoT</Typography>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography>Próximamente: visualizaciones de sensores y tableros IoT.</Typography>
      </Paper>
    </Container>
  );
}
