import React from "react";
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
        { label: "Componentes", path: "/productos/componentes" }
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
            <Typography variant="body2" color="grey.400" sx={{ maxWidth: 280 }}>
              Componentes electrónicos, soluciones IoT y cursos de tecnología.
              Innovando desde la academia y la industria para el mundo 🌎.
            </Typography>
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
                      href={link.path}
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
              <Typography variant="body2">contacto@titilab.store</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <PhoneIcon fontSize="small" />
              <Typography variant="body2">+51 985 979 119</Typography>
            </Stack>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Puno, Perú
            </Typography>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Síguenos
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link href="#" color="inherit"><FacebookIcon /></Link>
              <Link href="#" color="inherit"><InstagramIcon /></Link>
              <Link href="#" color="inherit"><YouTubeIcon /></Link>
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
