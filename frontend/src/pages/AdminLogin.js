import React, { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { apiFetch } from "../utils/api"; // ⬅️ usa el helper central

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Verifica token antes de entrar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 > Date.now()) {
        window.location.href = "/admin";
      } else {
        localStorage.removeItem("token");
      }
    } catch {
      localStorage.removeItem("token");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert("⚠️ Por favor, completa todos los campos");
      return;
    }

    try {
      const res = await apiFetch("/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      // Intenta parsear JSON; si el backend devolvió HTML/Texto, mostramos algo útil
      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        throw new Error(`Respuesta no-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
      }

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/admin";
      } else {
        alert(data.message || `❌ Error de login (HTTP ${res.status})`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("⚠️ Error de conexión con el servidor");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={10} p={4} boxShadow={3} borderRadius={2}>
        <Typography variant="h5" gutterBottom>
          🔐 Login de Administrador
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Usuario"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Ingresar
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default AdminLogin;
