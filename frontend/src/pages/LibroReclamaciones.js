import React, { useState } from "react";
import {
  Container, Typography, Grid, TextField, MenuItem, Radio, RadioGroup,
  FormControlLabel, Button, Card, CardContent, Snackbar, Alert, Checkbox, Box
} from "@mui/material";
import { apiPost } from "../utils/api";

const tiposDoc = ["DNI", "CE", "Pasaporte"];

function LibroReclamaciones() {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    tipoDoc: "DNI",
    nroDoc: "",
    email: "",
    telefono: "",
    direccion: "",
    tipo: "reclamo", // reclamo | queja
    productoServicio: "",
    pedidoId: "",
    detalle: "",
    pedidoConsumidor: "",
    acepta: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.acepta) {
      setSnackbar({ open: true, message: "Debes aceptar la política de datos.", severity: "warning" });
      return;
    }
    try {
      await apiPost("/claims", form, { withAuth: false });
      setSnackbar({ open: true, message: "Reclamo/queja enviado correctamente.", severity: "success" });
      setForm({
        nombres: "", apellidos: "", tipoDoc: "DNI", nroDoc: "", email: "", telefono: "",
        direccion: "", tipo: "reclamo", productoServicio: "", pedidoId: "", detalle: "",
        pedidoConsumidor: "", acepta: false
      });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "No se pudo enviar el reclamo.", severity: "error" });
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Libro de Reclamaciones
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Conforme a la normativa peruana, ponemos a tu disposición el Libro de Reclamaciones. Completa el formulario y te responderemos a la brevedad.
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Nombres" name="nombres" value={form.nombres} onChange={onChange} fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Apellidos" name="apellidos" value={form.apellidos} onChange={onChange} fullWidth required />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField select label="Tipo de documento" name="tipoDoc" value={form.tipoDoc} onChange={onChange} fullWidth>
                  {tiposDoc.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="N° Documento" name="nroDoc" value={form.nroDoc} onChange={onChange} fullWidth required />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField type="email" label="Correo" name="email" value={form.email} onChange={onChange} fullWidth required />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Teléfono" name="telefono" value={form.telefono} onChange={onChange} fullWidth required />
              </Grid>

              <Grid item xs={12}>
                <TextField label="Dirección" name="direccion" value={form.direccion} onChange={onChange} fullWidth />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Tipo</Typography>
                <RadioGroup row name="tipo" value={form.tipo} onChange={onChange}>
                  <FormControlLabel value="reclamo" control={<Radio />} label="Reclamo (disconformidad relacionada al producto o servicio)" />
                  <FormControlLabel value="queja" control={<Radio />} label="Queja (disconformidad no relacionada a los productos o servicios)" />
                </RadioGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Producto/Servicio" name="productoServicio" value={form.productoServicio} onChange={onChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="N° de pedido (opcional)" name="pedidoId" value={form.pedidoId} onChange={onChange} fullWidth />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Detalle del reclamo/queja"
                  name="detalle"
                  value={form.detalle}
                  onChange={onChange}
                  fullWidth
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Pedido del consumidor (solicitud)"
                  name="pedidoConsumidor"
                  value={form.pedidoConsumidor}
                  onChange={onChange}
                  fullWidth
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox name="acepta" checked={form.acepta} onChange={onChange} />
                  <Typography variant="body2">
                    Declaro ser el titular del reclamo y acepto el tratamiento de mis datos personales.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" size="large" fullWidth>
                  Enviar reclamo/queja
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default LibroReclamaciones;
