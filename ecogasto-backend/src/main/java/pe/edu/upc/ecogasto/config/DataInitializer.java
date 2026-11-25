package pe.edu.upc.ecogasto.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import pe.edu.upc.ecogasto.entities.Consumo;
import pe.edu.upc.ecogasto.entities.EcoTip;
import pe.edu.upc.ecogasto.entities.Hogar;
import pe.edu.upc.ecogasto.entities.HogarServicio;
import pe.edu.upc.ecogasto.entities.Insignia;
import pe.edu.upc.ecogasto.entities.InsigniaUsuario;
import pe.edu.upc.ecogasto.entities.Notificacion;
import pe.edu.upc.ecogasto.entities.PreferenciaNotificacion;
import pe.edu.upc.ecogasto.entities.Publicacion;
import pe.edu.upc.ecogasto.entities.Recurso;
import pe.edu.upc.ecogasto.entities.Reto;
import pe.edu.upc.ecogasto.entities.RetoUsuario;
import pe.edu.upc.ecogasto.entities.Rol;
import pe.edu.upc.ecogasto.entities.Tarifa;
import pe.edu.upc.ecogasto.entities.Usuario;
import pe.edu.upc.ecogasto.entities.Zona;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final String[] NOMBRES = {
            "Ana", "Luis", "Maria", "Jose", "Carmen", "Jorge", "Rosa", "Miguel", "Elena", "Cesar",
            "Julia", "Victor", "Patricia", "Raul", "Silvia", "Diego", "Lucia", "Andres", "Gloria", "Marco",
            "Teresa", "Fernando", "Karina", "Oscar", "Beatriz", "Ricardo", "Sandra", "Pablo", "Norma", "Hugo",
            "Delia", "Ivan", "Pilar", "Alonso", "Nadia", "Sergio", "Valeria", "Mateo", "Camila", "Bruno",
            "Sofia", "Renato", "Fabiola", "Gino", "Diana", "Erick", "Paola", "Kevin", "Milagros", "Hector"
    };

    private static final String[] APELLIDOS = {
            "Quispe", "Mamani", "Flores", "Rojas", "Vasquez", "Huaman", "Chavez", "Ramos", "Castillo", "Paredes",
            "Zapata", "Salazar", "Bautista", "Nunez", "Alvarado", "Cordova", "Ticona", "Guerrero", "Aguilar", "Palomino",
            "Mendoza", "Torres", "Vargas", "Castro", "Ortiz", "Delgado", "Herrera", "Medina", "Morales", "Romero",
            "Cruz", "Diaz", "Gomez", "Ruiz", "Silva", "Campos", "Vega", "Reyes", "Ponce", "Lozano",
            "Caceres", "Espinoza", "Mejia", "Navarro", "Sosa", "Bravo", "Leon", "Arias", "Pena", "Carrillo"
    };

    private final PasswordEncoder passwordEncoder;
    private final TransactionTemplate transactionTemplate;

    @PersistenceContext
    private EntityManager em;

    public DataInitializer(PasswordEncoder passwordEncoder, TransactionTemplate transactionTemplate) {
        this.passwordEncoder = passwordEncoder;
        this.transactionTemplate = transactionTemplate;
    }

    @Override
    public void run(String... args) {
        transactionTemplate.executeWithoutResult(status -> inicializar());
    }

    private void inicializar() {
        Rol rolUser = asegurarRol("USER");
        Rol rolAdmin = asegurarRol("ADMIN");

        Zona costa = asegurarZona("Costa", "Franja costera del Peru");
        Zona sierra = asegurarZona("Sierra", "Region andina del Peru");
        Zona selva = asegurarZona("Selva", "Region amazonica del Peru");

        Recurso agua = asegurarRecurso("Agua", "L/dia por persona", 0.0003);
        Recurso luz = asegurarRecurso("Luz", "kWh/mes", 0.20);
        Recurso gas = asegurarRecurso("Gas", "m3/mes", 2.00);
        Recurso transporte = asegurarRecurso("Transporte", "S//mes", 0.12);

        Map<String, Double> tarifas = new HashMap<>();
        asegurarTarifasZona(costa, 1.00, agua, luz, gas, transporte, tarifas);
        asegurarTarifasZona(sierra, 1.12, agua, luz, gas, transporte, tarifas);
        asegurarTarifasZona(selva, 1.25, agua, luz, gas, transporte, tarifas);

        List<Insignia> insignias = List.of(
                asegurarInsignia("Eco Novato", 50, "images/badge-50.png"),
                asegurarInsignia("Guardian del Ahorro", 110, "images/badge-60.png"),
                asegurarInsignia("Maestro Sostenible", 180, "images/badge-70.png")
        );

        List<Reto> retos = List.of(
                asegurarReto("Ahorra agua 10%", "Reduce tu consumo de agua en 10% respecto al mes anterior.", agua, 10, 50),
                asegurarReto("Ahorra luz 15%", "Disminuye tu consumo electrico en 15% este mes.", luz, 15, 60),
                asegurarReto("Gas responsable 20%", "Reduce tu consumo de gas en 20% frente a tu ultima lectura.", gas, 20, 70)
        );

        asegurarEcoTip(agua, "Todos", "Toma duchas de maximo 5 minutos y revisa que no existan fugas en inodoros o canos.");
        asegurarEcoTip(luz, "Todos", "Reemplaza focos antiguos por LED y desconecta cargadores o equipos en standby.");
        asegurarEcoTip(gas, "Todos", "Tapa las ollas al cocinar y regula la llama para que no sobresalga de la base.");
        asegurarEcoTip(transporte, "Todos", "Combina tus recorridos diarios y prioriza caminar, bicicleta o transporte publico.");

        asegurarAdmin(rolAdmin);

        cargarUsuariosDemo(rolUser, costa, sierra, selva, agua, luz, gas, transporte, tarifas, retos, insignias);
    }

    private void cargarUsuariosDemo(
            Rol rolUser,
            Zona costa,
            Zona sierra,
            Zona selva,
            Recurso agua,
            Recurso luz,
            Recurso gas,
            Recurso transporte,
            Map<String, Double> tarifas,
            List<Reto> retos,
            List<Insignia> insignias
    ) {
        Set<String> existentes = new HashSet<>(
                em.createQuery("SELECT u.username FROM Usuario u WHERE u.username LIKE 'ecouser%'", String.class)
                        .getResultList()
        );
        if (existentes.size() >= 50) {
            return;
        }

        String passwordDemo = passwordEncoder.encode("Demo1234");

        for (int i = 1; i <= 50; i++) {
            String username = String.format("ecouser%02d", i);
            if (existentes.contains(username)) {
                continue;
            }

            String nombre = NOMBRES[i - 1];
            String apellido = APELLIDOS[i - 1];
            String email = (nombre + "." + apellido + i + "@ecogasto.pe").toLowerCase();

            Zona zona = i <= 25 ? costa : (i <= 40 ? sierra : selva);
            boolean esPadre = (i % 5 != 0 && i % 5 != 2);
            String segmento = esPadre ? "Padre de familia" : "Joven independiente";
            int personas = esPadre ? 3 + (i % 4) : 1 + (i % 2);

            Usuario usuario = new Usuario();
            usuario.setUsername(username);
            usuario.setEmail(email);
            usuario.setPassword(passwordDemo);
            usuario.setNombreCompleto(nombre + " " + apellido);
            usuario.setSegmento(segmento);
            usuario.setActivo(true);
            usuario.setIntentosFallidos(0);
            usuario.setFechaRegistro(LocalDate.of(2026, 1, 1).plusDays(i % 25));
            usuario.setRol(rolUser);
            em.persist(usuario);

            PreferenciaNotificacion pref = new PreferenciaNotificacion();
            pref.setUsuario(usuario);
            pref.setNotifAgua(true);
            pref.setNotifLuz(true);
            pref.setNotifGas(true);
            pref.setNotifTransporte(true);
            pref.setAceptaRetos(true);
            pref.setRecordatorioSemanal(i % 2 == 0);
            em.persist(pref);

            Hogar hogar = new Hogar();
            hogar.setUsuario(usuario);
            hogar.setZona(zona);
            hogar.setEsPadre(esPadre);
            hogar.setNumPersonas(personas);
            hogar.setFechaActualizacion(LocalDate.now());
            em.persist(hogar);

            List<Recurso> servicios = new ArrayList<>();
            boolean tieneAgua;
            boolean tieneLuz;
            boolean tieneGas;
            boolean tieneTrans;

            if (zona == costa) {
                tieneAgua = true;
                tieneLuz = true;
                tieneGas = (i % 7 != 0);
                tieneTrans = (i % 9 != 0);
            } else if (zona == sierra) {
                tieneAgua = (i % 5 != 0);
                tieneLuz = (i % 8 != 0);
                tieneGas = (i % 2 == 0);
                tieneTrans = (i % 3 != 0);
            } else {
                tieneAgua = (i % 3 != 0);
                tieneLuz = (i % 5 != 0);
                tieneGas = (i % 3 == 0);
                tieneTrans = (i % 2 == 0);
            }

            if (tieneAgua) servicios.add(agua);
            if (tieneLuz) servicios.add(luz);
            if (tieneGas) servicios.add(gas);
            if (tieneTrans) servicios.add(transporte);

            double perfil = (i % 3 == 0) ? 0.72 : (i % 3 == 1 ? 1.00 : 1.32);

            for (Recurso recurso : servicios) {
                HogarServicio hs = new HogarServicio();
                hs.setHogar(hogar);
                hs.setRecurso(recurso);
                em.persist(hs);

                double base = consumoBase(recurso.getNombre(), zona.getNombre());
                double tarifaValor = tarifas.getOrDefault(claveTarifa(zona, recurso), 1.0);

                for (int mes = 1; mes <= 11; mes++) {
                    double factorEstacional = 1.0 + 0.08 * Math.sin((mes + i) * 0.65) + ((i % 7) - 3) * 0.015;
                    double valor = Math.max(1.0, redondear2(base * perfil * factorEstacional));
                    double costo = recurso.getNombre().equals("Agua")
                            ? redondear2(valor * personas * 30 * tarifaValor)
                            : redondear2(valor * tarifaValor);

                    Consumo consumo = new Consumo();
                    consumo.setHogar(hogar);
                    consumo.setRecurso(recurso);
                    consumo.setAnio(2026);
                    consumo.setMes(mes);
                    consumo.setValor(valor);
                    consumo.setCostoEstimado(costo);
                    consumo.setFechaRegistro(LocalDate.of(2026, mes, 10 + (i % 12)));
                    em.persist(consumo);
                }

                if (i % 4 == 0 && perfil > 1.2 && recurso.getNombre().equals("Agua")) {
                    Notificacion notif = new Notificacion();
                    notif.setUsuario(usuario);
                    notif.setRecurso(recurso);
                    notif.setTitulo("Alerta de " + recurso.getNombre());
                    notif.setMensaje("Tu consumo de Agua en 11/2026 supero en mas de 20% tu promedio habitual. Revisa valvulas o habitos.");
                    notif.setLeida(false);
                    notif.setFecha(LocalDateTime.now().minusDays(i % 10));
                    em.persist(notif);
                }
            }

            int puntosUsuario = 0;
            for (int rIdx = 0; rIdx < retos.size(); rIdx++) {
                Reto reto = retos.get(rIdx);
                if (i <= 28 && rIdx < (1 + (i % 3))) {
                    RetoUsuario ru = new RetoUsuario();
                    ru.setUsuario(usuario);
                    ru.setReto(reto);
                    ru.setEstado("COMPLETADO");
                    ru.setFechaInicio(LocalDate.of(2026, 9, 5));
                    ru.setFechaCompletado(LocalDate.of(2026, 10, 15).plusDays(i % 15));
                    em.persist(ru);
                    puntosUsuario += reto.getPuntos();
                } else if (i > 28 && i <= 40 && rIdx == 0) {
                    RetoUsuario ru = new RetoUsuario();
                    ru.setUsuario(usuario);
                    ru.setReto(reto);
                    ru.setEstado("EN_CURSO");
                    ru.setFechaInicio(LocalDate.of(2026, 11, 1));
                    ru.setFechaCompletado(null);
                    em.persist(ru);
                }
            }

            for (Insignia insignia : insignias) {
                if (insignia.getPuntosRequeridos() <= puntosUsuario) {
                    InsigniaUsuario iu = new InsigniaUsuario();
                    iu.setUsuario(usuario);
                    iu.setInsignia(insignia);
                    iu.setFechaObtencion(LocalDate.of(2026, 11, 2));
                    em.persist(iu);
                }
            }

            crearPublicacionDemo(usuario, i);
        }
    }

    private void crearPublicacionDemo(Usuario usuario, int i) {
        String contenido;
        String imagenUrl = null;
        switch (i) {
            case 1 -> contenido = "Cambie todos los focos de mi departamento a LED y mi recibo de luz bajo 18% este mes.";
            case 4 -> {
                contenido = "Instale un pequeno huerto en casa y reutilizo el agua del lavado de verduras para regarlo.";
                imagenUrl = "images/cultivando.jpg";
            }
            case 8 -> {
                contenido = "Empece a ir al trabajo en bicicleta tres veces por semana y ahorre mas de S/ 90 en transporte.";
                imagenUrl = "images/bicicleta.jpg";
            }
            case 12 -> contenido = "Revisando los graficos de EcoGasto detectamos una fuga pequena en el inodoro. Gran ahorro!";
            case 18 -> {
                contenido = "Probamos un panel solar portatil para cargar dispositivos en casa y redujimos el consumo electrico.";
                imagenUrl = "images/panelsolar.jpg.webp";
            }
            case 26 -> contenido = "En la Sierra el gas en balon rinde mucho mas tapando las ollas al cocinar y regulando la llama.";
            case 33 -> contenido = "Con duchas de 5 minutos logramos bajar nuestro consumo de agua por debajo del promedio nacional.";
            case 42 -> contenido = "Excelente herramienta para llevar el control mensual de los gastos del hogar en familia.";
            default -> {
                return;
            }
        }
        Publicacion pub = new Publicacion();
        pub.setUsuario(usuario);
        pub.setContenido(contenido);
        pub.setImagenUrl(imagenUrl);
        pub.setFecha(LocalDateTime.now().minusDays(i % 14));
        em.persist(pub);
    }

    private double consumoBase(String recurso, String zona) {
        return switch (recurso) {
            case "Agua" -> zona.equals("Costa") ? 155.0 : (zona.equals("Sierra") ? 105.0 : 118.0);
            case "Luz" -> zona.equals("Costa") ? 102.0 : (zona.equals("Sierra") ? 76.0 : 72.0);
            case "Gas" -> zona.equals("Costa") ? 14.5 : (zona.equals("Sierra") ? 9.8 : 8.5);
            default -> zona.equals("Costa") ? 165.0 : (zona.equals("Sierra") ? 110.0 : 98.0);
        };
    }

    private double redondear2(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }

    private String claveTarifa(Zona zona, Recurso recurso) {
        return zona.getNombre() + "|" + recurso.getNombre();
    }

    private Rol asegurarRol(String nombre) {
        List<Rol> existentes = em.createQuery("SELECT r FROM Rol r WHERE r.nombre = :nombre", Rol.class)
                .setParameter("nombre", nombre)
                .getResultList();
        if (!existentes.isEmpty()) {
            return existentes.get(0);
        }
        Rol rol = new Rol();
        rol.setNombre(nombre);
        em.persist(rol);
        return rol;
    }

    private Zona asegurarZona(String nombre, String descripcion) {
        List<Zona> existentes = em.createQuery("SELECT z FROM Zona z WHERE z.nombre = :nombre", Zona.class)
                .setParameter("nombre", nombre)
                .getResultList();
        if (!existentes.isEmpty()) {
            return existentes.get(0);
        }
        Zona zona = new Zona();
        zona.setNombre(nombre);
        zona.setDescripcion(descripcion);
        zona.setActiva(true);
        em.persist(zona);
        return zona;
    }

    private Recurso asegurarRecurso(String nombre, String unidad, double factorCo2) {
        List<Recurso> existentes = em.createQuery("SELECT r FROM Recurso r WHERE r.nombre = :nombre", Recurso.class)
                .setParameter("nombre", nombre)
                .getResultList();
        if (!existentes.isEmpty()) {
            return existentes.get(0);
        }
        Recurso recurso = new Recurso();
        recurso.setNombre(nombre);
        recurso.setUnidad(unidad);
        recurso.setFactorCo2(factorCo2);
        em.persist(recurso);
        return recurso;
    }

    private void asegurarTarifasZona(
            Zona zona,
            double factor,
            Recurso agua,
            Recurso luz,
            Recurso gas,
            Recurso transporte,
            Map<String, Double> tarifas
    ) {
        tarifas.put(claveTarifa(zona, agua), asegurarTarifa(agua, zona, 0.0052 * factor, 100.0, 175.0, 145.0).getTarifa());
        tarifas.put(claveTarifa(zona, luz), asegurarTarifa(luz, zona, 0.6800 * factor, 60.0, 110.0, 82.3).getTarifa());
        tarifas.put(claveTarifa(zona, gas), asegurarTarifa(gas, zona, 2.1000 * factor, 8.0, 16.0, 12.0).getTarifa());
        tarifas.put(claveTarifa(zona, transporte), asegurarTarifa(transporte, zona, 1.0000 * factor, 80.0, 200.0, 140.0).getTarifa());
    }

    private Tarifa asegurarTarifa(Recurso recurso, Zona zona, double tarifaValor, double umbralBajo, double umbralAlto, double promedioNacional) {
        List<Tarifa> existentes = em.createQuery(
                        "SELECT t FROM Tarifa t WHERE t.recurso = :recurso AND t.zona = :zona", Tarifa.class)
                .setParameter("recurso", recurso)
                .setParameter("zona", zona)
                .getResultList();
        if (!existentes.isEmpty()) {
            return existentes.get(0);
        }
        Tarifa tarifa = new Tarifa();
        tarifa.setRecurso(recurso);
        tarifa.setZona(zona);
        tarifa.setTarifa(Math.round(tarifaValor * 10000.0) / 10000.0);
        tarifa.setUmbralBajo(umbralBajo);
        tarifa.setUmbralAlto(umbralAlto);
        tarifa.setPromedioNacional(promedioNacional);
        em.persist(tarifa);
        return tarifa;
    }

    private Insignia asegurarInsignia(String nombre, int puntosRequeridos, String imagenUrl) {
        List<Insignia> existentes = em.createQuery("SELECT i FROM Insignia i WHERE i.nombre = :nombre", Insignia.class)
                .setParameter("nombre", nombre)
                .getResultList();
        if (!existentes.isEmpty()) {
            return existentes.get(0);
        }
        Insignia insignia = new Insignia();
        insignia.setNombre(nombre);
        insignia.setPuntosRequeridos(puntosRequeridos);
        insignia.setImagenUrl(imagenUrl);
        em.persist(insignia);
        return insignia;
    }

    private Reto asegurarReto(String titulo, String descripcion, Recurso recurso, int metaPorcentaje, int puntos) {
        List<Reto> existentes = em.createQuery("SELECT r FROM Reto r WHERE r.titulo = :titulo", Reto.class)
                .setParameter("titulo", titulo)
                .getResultList();
        if (!existentes.isEmpty()) {
            return existentes.get(0);
        }
        Reto reto = new Reto();
        reto.setTitulo(titulo);
        reto.setDescripcion(descripcion);
        reto.setRecurso(recurso);
        reto.setMetaPorcentaje(metaPorcentaje);
        reto.setPuntos(puntos);
        reto.setActivo(true);
        em.persist(reto);
        return reto;
    }

    private void asegurarEcoTip(Recurso recurso, String segmento, String texto) {
        Long total = em.createQuery("SELECT COUNT(e) FROM EcoTip e WHERE e.recurso = :recurso", Long.class)
                .setParameter("recurso", recurso)
                .getSingleResult();
        if (total > 0) {
            return;
        }
        EcoTip tip = new EcoTip();
        tip.setRecurso(recurso);
        tip.setSegmento(segmento);
        tip.setTexto(texto);
        tip.setActivo(true);
        em.persist(tip);
    }

    private void asegurarAdmin(Rol rolAdmin) {
        Long total = em.createQuery("SELECT COUNT(u) FROM Usuario u WHERE u.username = :username", Long.class)
                .setParameter("username", "admin")
                .getSingleResult();
        if (total > 0) {
            return;
        }
        Usuario admin = new Usuario();
        admin.setUsername("admin");
        admin.setEmail("admin@ecogasto.pe");
        admin.setPassword(passwordEncoder.encode("EcoGasto2025"));
        admin.setNombreCompleto("Administrador EcoGasto");
        admin.setSegmento("Administrador");
        admin.setActivo(true);
        admin.setIntentosFallidos(0);
        admin.setFechaRegistro(LocalDate.now());
        admin.setRol(rolAdmin);
        em.persist(admin);
    }
}
