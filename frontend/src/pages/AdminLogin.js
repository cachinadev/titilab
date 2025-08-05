import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Check token validity before redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          // token valid → redirect to admin
          window.location.href = "/admin";
        } else {
          // token expired → remove it
          localStorage.removeItem("token");
        }
      } catch {
        // token malformed → remove it
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert("⚠️ Por favor, completa todos los campos");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/admin";
      } else {
        alert(data.message || "❌ Credenciales incorrectas");
      }
    } catch (error) {
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
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Ingresar
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default AdminLogin;
