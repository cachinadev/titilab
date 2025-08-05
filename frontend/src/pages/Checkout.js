import React, { useEffect, useState } from "react";
import {
  Container, Typography, Grid, TextField, Button,
  Card, CardContent, Divider, MenuItem, Stepper, Step, StepLabel,
  Radio, RadioGroup, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";

import departamentos from "../data/ubigeo_peru_2016_departamentos.json";
import provincias from "../data/ubigeo_peru_2016_provincias.json";
import distritos from "../data/ubigeo_peru_2016_distritos.json";

const pasos = ["Carrito", "Datos", "Pago", "Confirmación"];

function Checkout() {
  const [cart, setCart] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [departamento, setDepartamento] = useState("");
  const [provincia, setProvincia] = useState("");
  const [distrito, setDistrito] = useState("");
  const [courier, setCourier] = useState("Olva");
  const [tipoComprobante, setTipoComprobante] = useState("boleta");
  const [metodoPago, setMetodoPago] = useState("transferencia");
  const [formData, setFormData] = useState({
    nombre: "", email: "", direccion: "", telefono: "", dni: "", ruc: "", empresa: ""
  });

  const [openModal, setOpenModal] = useState(false);

  // Datos de confirmación
  const [orderId, setOrderId] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  const getSubtotal = () =>
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const getEnvio = () => courier === "Olva" ? 15 : 20;
  const getTotal = () => (getSubtotal() + getEnvio()).toFixed(2);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validarDNI = (dni) => /^\d{8}$/.test(dni);
  const validarRUC = (ruc) => /^\d{11}$/.test(ruc) && ["10", "15", "17", "20"].includes(ruc.substring(0, 2));

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validaciones
  if (!formData.nombre || !formData.email || !formData.direccion) {
    alert("Por favor, completa todos los campos obligatorios.");
    return;
    }
    if (tipoComprobante === "boleta" && !validarDNI(formData.dni)) {
      alert("DNI inválido");
      return;
    }
    if (tipoComprobante === "factura" && (!validarRUC(formData.ruc) || !formData.empresa)) {
      alert("RUC o Razón social inválidos");
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tipoComprobante,
          departamento,
          provincia,
          distrito,
          courier,
          metodoPago,
          cart,
          total: getTotal(),
          status: "pendiente" // 📌 Nuevo campo para el backend
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrderId(data.orderId || "N/A");
        setTrackingCode(data.tracking || "En preparación");
        localStorage.removeItem("cart");
        setCart([]);
        setActiveStep(3);
      } else {
        alert(data.error || "❌ Hubo un problema al procesar tu pedido.");
      }
    } catch (error) {
      console.error("Error enviando pedido:", error);
      alert("❌ Error de conexión con el servidor.");
    }
  };

  const provinciasFiltradas = provincias.filter((prov) => prov.department_id === departamento);
  const distritosFiltrados = distritos.filter((dist) => dist.province_id === provincia);

  const handleMetodoPagoChange = (value) => {
    setMetodoPago(value);
    if (activeStep === 2) {
      setOpenModal(true);
    }
  };

  if (cart.length === 0 && activeStep < 3) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h5">🛒 No hay productos en tu carrito</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {pasos.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Pantalla de confirmación */}
{activeStep === 3 ? (
  <Grid container spacing={4} sx={{ mt: 4, textAlign: "center" }}>
    <Grid item xs={12}>
      <Typography variant="h4" gutterBottom>
        Código de pedido: <b>{orderId}</b>
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Hemos enviado un comprobante y detalles de tu compra al correo:{" "}
        <b>{formData.email}</b>
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Código de seguimiento: <b>{trackingCode}</b>
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: 4 }}
        onClick={() => window.location.href = "/"}
      >
        Volver a la tienda
      </Button>
    </Grid>
  </Grid>
) : (
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Formulario */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Datos de envío</Typography>
            <form onSubmit={handleSubmit}>
              <TextField label="Nombre completo" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth margin="normal" required />
              <TextField label="Correo electrónico" type="email" name="email" value={formData.email} onChange={handleChange} fullWidth margin="normal" required />
              <TextField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} fullWidth margin="normal" required />
              <TextField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} fullWidth margin="normal" required />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Tipo de Comprobante</Typography>
              <RadioGroup value={tipoComprobante} onChange={(e) => setTipoComprobante(e.target.value)}>
                <FormControlLabel value="boleta" control={<Radio />} label="Boleta" />
                <FormControlLabel value="factura" control={<Radio />} label="Factura" />
              </RadioGroup>

              {tipoComprobante === "boleta" && (
                <TextField label="DNI" name="dni" value={formData.dni} onChange={handleChange} fullWidth margin="normal" required />
              )}
              {tipoComprobante === "factura" && (
                <>
                  <TextField label="RUC" name="ruc" value={formData.ruc} onChange={handleChange} fullWidth margin="normal" required />
                  <TextField label="Razón Social" name="empresa" value={formData.empresa} onChange={handleChange} fullWidth margin="normal" required />
                </>
              )}

              <TextField select label="Departamento" value={departamento} onChange={(e) => { setDepartamento(e.target.value); setProvincia(""); setDistrito(""); }} fullWidth margin="normal" required>
                {departamentos.map(dep => (
                  <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Provincia" value={provincia} onChange={(e) => { setProvincia(e.target.value); setDistrito(""); }} fullWidth margin="normal" required disabled={!departamento}>
                {provinciasFiltradas.map(prov => (
                  <MenuItem key={prov.id} value={prov.id}>{prov.name}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Distrito" value={distrito} onChange={(e) => setDistrito(e.target.value)} fullWidth margin="normal" required disabled={!provincia}>
                {distritosFiltrados.map(dist => (
                  <MenuItem key={dist.id} value={dist.id}>{dist.name}</MenuItem>
                ))}
              </TextField>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Método de envío</Typography>
              <RadioGroup value={courier} onChange={(e) => setCourier(e.target.value)}>
                <FormControlLabel value="Olva" control={<Radio />} label="Olva Courier - S/15.00" />
                <FormControlLabel value="Shalom" control={<Radio />} label="Shalom - S/20.00" />
              </RadioGroup>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Método de pago</Typography>
              <RadioGroup value={metodoPago} onChange={(e) => handleMetodoPagoChange(e.target.value)}>
                <FormControlLabel value="transferencia" control={<Radio />} label="Transferencia bancaria" />
                <FormControlLabel value="yape" control={<Radio />} label="Yape" />
                <FormControlLabel value="plin" control={<Radio />} label="Plin" />
              </RadioGroup>

              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Realizar Pedido
              </Button>
            </form>
          </Grid>

          {/* Resumen */}
          <Grid item xs={12} md={6} sx={{ position: "sticky", top: "20px" }}>
            <Typography variant="h6" gutterBottom>Resumen de compra</Typography>
            <Card>
              <CardContent>
                {cart.map(item => (
                  <div key={item._id} style={{ marginBottom: "10px" }}>
                    <Typography variant="body1">{item.name} x {item.quantity}</Typography>
                    <Typography variant="body2" color="text.secondary">S/ {(item.price * item.quantity).toFixed(2)}</Typography>
                    <Divider sx={{ my: 1 }} />
                  </div>
                ))}
                <Typography variant="body1">Subtotal: S/ {getSubtotal().toFixed(2)}</Typography>
                <Typography variant="body1">Envío: S/ {getEnvio().toFixed(2)}</Typography>
                <Typography variant="h6" align="right">Total: S/ {getTotal()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>
          {metodoPago === "transferencia" && "💳 Cuentas bancarias"}
          {metodoPago === "yape" && "📱 Pago con Yape"}
          {metodoPago === "plin" && "📱 Pago con Plin"}
        </DialogTitle>
        <DialogContent>
          {metodoPago === "transferencia" && (
            <>
              <Typography variant="body1">BCP: 123-45678901-0-12</Typography>
              <Typography variant="body1">Interbank: 123-45678901</Typography>
            </>
          )}
          {(metodoPago === "yape" || metodoPago === "plin") && (
            <img src={`/images/${metodoPago}.png`} alt={`${metodoPago} QR`} style={{ width: "250px", marginTop: "10px" }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Checkout;
