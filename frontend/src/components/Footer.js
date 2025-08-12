import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Container, Grid, Typography, Link, Divider, Stack } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

function Footer() {
  const categoryStructure = [
    {
      name: "Productos",
      links: [
        { label: "Microcontroladores", path: "/productos/microcontroladores" },
        { label: "Arduino", path: "/productos/arduino" },
        { label: "ESP32", path: "/productos/esp32" },
        { label: "Raspberry", path: "/productos/raspberry" },
        { label: "Sensores", path: "/productos/sensores" },
        { label: "Componentes", path: "/productos/componentes" },
        { label: "Domótica", path: "/productos/domotica" },
        { label: "IoT", path: "/productos/iot" }
      ]
    },
    {
      name: "Industria",
      links: [
        { label: "Minería", path: "/industria/mineria" },
        { label: "Pesquería", path: "/industria/pesqueria" },
        { label: "Ganadería", path: "/industria/ganaderia" },
        { label: "Construcción", path: "/industria/construccion" },
        { label: "Militar", path: "/industria/militar" },
        { label: "Agricultura", path: "/industria/agricultura" }
      ]
    },
    { name: "Impresión 3D", links: [{ label: "Ver todo", path: "/impresion3d" }] },
    { name: "Robótica", links: [{ label: "Ver todo", path: "/robotica" }] },
    { name: "Cursos", links: [{ label: "Ver todo", path: "/cursos" }] }
  ];

  return (
    <Box sx={{ bgcolor: "#1e1e1e", color: "#fff", mt: 6, pt: 6, pb: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo & About */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Titilab Store
            </Typography>
            <Typography variant="body2" color="grey.400" sx={{ maxWidth: 320 }}>
              Componentes electrónicos, soluciones IoT y cursos de tecnología.
              Innovando desde la academia y la industria para el mundo 🌎.
            </Typography>

            {/* Libro de Reclamaciones */}
            <Box sx={{ mt: 2 }}>
              <Link
                component={RouterLink}
                to="/libro-de-reclamaciones"
                underline="none"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "#fff",
                  color: "#000",
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  boxShadow: 2,
                  "&:hover": { boxShadow: 4 }
                }}
              >
                <img
                  src="/images/reclamos.jpg" /* si tu archivo es .jpg/.svg, cambia la extensión */
                  alt="Libro de Reclamaciones"
                  style={{ height: 34, display: "block" }}
                />
                <Typography variant="body2" fontWeight="bold">
                  Libro de Reclamaciones
                </Typography>
              </Link>
            </Box>
          </Grid>

          {/* Navigation Links */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              {categoryStructure.map((cat, idx) => (
                <Grid item xs={6} sm={4} key={idx}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {cat.name}
                  </Typography>
                  {cat.links.map((link, i) => (
                    <Link
                      key={i}
                      component={RouterLink}
                      to={link.path}
                      color="inherit"
                      underline="hover"
                      display="block"
                      sx={{ mb: 0.5, "&:hover": { color: "primary.main" } }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Contact & Social */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contáctanos
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <EmailIcon fontSize="small" />
              <Link href="mailto:contacto@titilab.store" color="inherit" underline="hover">
                <Typography variant="body2">contacto@titilab.store</Typography>
              </Link>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <PhoneIcon fontSize="small" />
              <Link href="tel:+51985979119" color="inherit" underline="hover">
                <Typography variant="body2">+51 985 979 119</Typography>
              </Link>
            </Stack>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Puno, Perú
            </Typography>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Síguenos
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link href="#" color="inherit" target="_blank" rel="noopener noreferrer">
                <FacebookIcon />
              </Link>
              <Link href="#" color="inherit" target="_blank" rel="noopener noreferrer">
                <InstagramIcon />
              </Link>
              <Link href="#" color="inherit" target="_blank" rel="noopener noreferrer">
                <YouTubeIcon />
              </Link>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ bgcolor: "grey.700", my: 3 }} />

        {/* Bottom */}
        <Typography variant="body2" color="grey.500" align="center">
          © {new Date().getFullYear()} Titilab Store | Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
