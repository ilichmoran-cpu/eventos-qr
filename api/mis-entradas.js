import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";


/* ============================================================
   LIVE TICKETS
   API MIS ENTRADAS / LIVE PASS
============================================================ */


/* ============================================================
   VARIABLES DE ENTORNO
============================================================ */

const SUPABASE_URL =
    process.env.SUPABASE_URL;


const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY;


/* ============================================================
   CONFIGURACIÓN
============================================================ */

const COOKIE_NAME =
    "lt_livepass";


/* ============================================================
   SUPABASE
============================================================ */

const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {

                persistSession:
                    false,

                autoRefreshToken:
                    false

            }
        }
    );


/* ============================================================
   RESPUESTA JSON
============================================================ */

function sendJSON(
    response,
    status,
    body
) {

    response.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
    );


    return response
        .status(status)
        .json(body);

}


/* ============================================================
   LEER COOKIES
============================================================ */

function parseCookies(request) {

    const result =
        {};


    const header =
        request.headers.cookie
        ||
        "";


    header
        .split(";")
        .forEach(
            part => {


                const index =
                    part.indexOf("=");


                if (
                    index ===
                    -1
                ) {

                    return;

                }


                const key =
                    part
                    .slice(
                        0,
                        index
                    )
                    .trim();


                const value =
                    part
                    .slice(
                        index + 1
                    )
                    .trim();


                try {


                    result[key] =
                        decodeURIComponent(
                            value
                        );


                }

                catch {


                    result[key] =
                        value;

                }

            }
        );


    return result;

}


/* ============================================================
   HASH TOKEN DE SESIÓN
============================================================ */

function hashSessionToken(token) {

    return crypto
        .createHash(
            "sha256"
        )
        .update(
            token
        )
        .digest(
            "hex"
        );

}


/* ============================================================
   BORRAR COOKIE
============================================================ */

function clearSessionCookie() {

    return [

        `${COOKIE_NAME}=`,

        "Path=/",

        "HttpOnly",

        "Secure",

        "SameSite=Lax",

        "Max-Age=0",

        "Expires=Thu, 01 Jan 1970 00:00:00 GMT"

    ]
    .join("; ");

}


/* ============================================================
   HANDLER PRINCIPAL
============================================================ */

export default async function handler(
    request,
    response
) {

    /* ========================================================
       SOLO GET
    ======================================================== */

    if (
        request.method !==
        "GET"
    ) {

        return sendJSON(
            response,
            405,
            {

                success:
                    false,

                message:
                    "Método no permitido."

            }
        );

    }


    try {


        /* ====================================================
           VERIFICAR CONFIGURACIÓN
        ==================================================== */

        if (
            !SUPABASE_URL
            ||
            !SUPABASE_SERVICE_ROLE_KEY
        ) {

            throw new Error(
                "Configuración del servidor incompleta."
            );

        }


        /* ====================================================
           OBTENER COOKIE
        ==================================================== */

        const cookies =
            parseCookies(
                request
            );


        const token =
            cookies[
                COOKIE_NAME
            ];


        /* ====================================================
           SIN COOKIE
        ==================================================== */

        if (!token) {

            return sendJSON(
                response,
                401,
                {

                    success:
                        false,

                    authenticated:
                        false,

                    message:
                        "Sesión no iniciada."

                }
            );

        }


        /* ====================================================
           HASH DEL TOKEN
        ==================================================== */

        const tokenHash =
            hashSessionToken(
                token
            );


        /* ====================================================
           BUSCAR SESIÓN ACTIVA
        ==================================================== */

        const {
            data: session,
            error: sessionError
        } =
        await supabase
            .from(
                "cliente_sesiones"
            )
            .select(`
                id,
                email,
                expires_at,
                ultimo_uso_at,
                created_at
            `)
            .eq(
                "token_hash",
                tokenHash
            )
            .gt(
                "expires_at",
                new Date()
                .toISOString()
            )
            .maybeSingle();


        if (sessionError) {

            throw sessionError;

        }


        /* ====================================================
           SESIÓN VENCIDA / INVÁLIDA
        ==================================================== */

        if (!session) {


            response.setHeader(
                "Set-Cookie",
                clearSessionCookie()
            );


            return sendJSON(
                response,
                401,
                {

                    success:
                        false,

                    authenticated:
                        false,

                    message:
                        "Tu sesión venció. Ingresa nuevamente."

                }
            );

        }


        /* ====================================================
           ACTUALIZAR ÚLTIMO USO
        ==================================================== */

        const now =
            new Date()
            .toISOString();


        const {
            error: updateSessionError
        } =
        await supabase
            .from(
                "cliente_sesiones"
            )
            .update(
                {

                    ultimo_uso_at:
                        now

                }
            )
            .eq(
                "id",
                session.id
            );


        if (
            updateSessionError
        ) {

            console.warn(
                "Actualizar último uso:",
                updateSessionError
            );

        }


        /* ====================================================
           NORMALIZAR EMAIL
        ==================================================== */

        const customerEmail =
            String(
                session.email
                ||
                ""
            )
            .trim()
            .toLowerCase();


        if (!customerEmail) {

            throw new Error(
                "La sesión no tiene un correo válido."
            );

        }


        /* ====================================================
           BUSCAR RESERVAS PAGADAS
        ==================================================== */

        const {
            data: reservations,
            error: reservationError
        } =
        await supabase
            .from(
                "reservas"
            )
            .select(`
                id,
                evento_id,
                nombre_cliente,
                telefono,
                email,
                estado,
                precio_unitario,
                cantidad_asientos,
                total_reserva,
                paid_at,
                created_at
            `)
            .ilike(
                "email",
                customerEmail
            )
            .eq(
                "estado",
                "pagada"
            )
            .order(
                "paid_at",
                {
                    ascending:
                        false
                }
            );


        if (reservationError) {

            throw reservationError;

        }


        const reservationRows =
            reservations
            ||
            [];


        /* ====================================================
           SIN COMPRAS
        ==================================================== */

        if (
            reservationRows.length ===
            0
        ) {

            return sendJSON(
                response,
                200,
                {

                    success:
                        true,

                    authenticated:
                        true,

                    email:
                        customerEmail,

                    nombre:
                        "",

                    reservas:
                        []

                }
            );

        }


        /* ====================================================
           IDS DE EVENTOS
        ==================================================== */

        const eventIds =
            [
                ...new Set(

                    reservationRows

                    .map(
                        reservation =>
                            reservation.evento_id
                    )

                    .filter(
                        value =>
                            value !==
                            null
                            &&
                            value !==
                            undefined
                    )

                )
            ];


        /* ====================================================
           EVENTOS
        ==================================================== */

        let events =
            [];


        if (
            eventIds.length >
            0
        ) {


            const {
                data,
                error
            } =
            await supabase
                .from(
                    "eventos"
                )
                .select(`
                    id,
                    nombre,
                    fecha,
                    lugar,
                    flyer_url,
                    descripcion
                `)
                .in(
                    "id",
                    eventIds
                );


            if (error) {

                throw error;

            }


            events =
                data
                ||
                [];

        }


        /* ====================================================
           IDS DE RESERVA
        ==================================================== */

        const reservationIds =
            reservationRows
            .map(
                reservation =>
                    reservation.id
            );


        /* ====================================================
           BOLETOS
        ==================================================== */

        const {
            data: tickets,
            error: ticketError
        } =
        await supabase
            .from(
                "boletos"
            )
            .select(`
                id,
                reserva_id,
                asiento_id,
                token,
                estado,
                fecha_creacion,
                fecha_ingreso
            `)
            .in(
                "reserva_id",
                reservationIds
            )
            .order(
                "id",
                {
                    ascending:
                        true
                }
            );


        if (ticketError) {

            throw ticketError;

        }


        const ticketRows =
            tickets
            ||
            [];


        /* ====================================================
           IDS DE ASIENTOS
        ==================================================== */

        const seatIds =
            [
                ...new Set(

                    ticketRows

                    .map(
                        ticket =>
                            ticket.asiento_id
                    )

                    .filter(
                        value =>
                            value !==
                            null
                            &&
                            value !==
                            undefined
                    )

                )
            ];


        /* ====================================================
           ASIENTOS
        ==================================================== */

        let seats =
            [];


        if (
            seatIds.length >
            0
        ) {


            const {
                data,
                error
            } =
            await supabase
                .from(
                    "asientos"
                )
                .select(`
                    id,
                    numero,
                    mesa_id,
                    estado
                `)
                .in(
                    "id",
                    seatIds
                );


            if (error) {

                throw error;

            }


            seats =
                data
                ||
                [];

        }


        /* ====================================================
           IDS DE MESAS
        ==================================================== */

        const tableIds =
            [
                ...new Set(

                    seats

                    .map(
                        seat =>
                            seat.mesa_id
                    )

                    .filter(
                        value =>
                            value !==
                            null
                            &&
                            value !==
                            undefined
                    )

                )
            ];


        /* ====================================================
           MESAS
        ==================================================== */

        let tables =
            [];


        if (
            tableIds.length >
            0
        ) {


            const {
                data,
                error
            } =
            await supabase
                .from(
                    "mesas"
                )
                .select(`
                    id,
                    numero,
                    evento_id
                `)
                .in(
                    "id",
                    tableIds
                );


            if (error) {

                throw error;

            }


            tables =
                data
                ||
                [];

        }


        /* ====================================================
           MAPA DE EVENTOS
        ==================================================== */

        const eventMap =
            new Map(
                events
                .map(
                    event => [

                        Number(
                            event.id
                        ),

                        event

                    ]
                )
            );


        /* ====================================================
           MAPA DE ASIENTOS
        ==================================================== */

        const seatMap =
            new Map(
                seats
                .map(
                    seat => [

                        Number(
                            seat.id
                        ),

                        seat

                    ]
                )
            );


        /* ====================================================
           MAPA DE MESAS
        ==================================================== */

        const tableMap =
            new Map(
                tables
                .map(
                    table => [

                        Number(
                            table.id
                        ),

                        table

                    ]
                )
            );


        /* ====================================================
           CONSTRUIR RESERVAS
        ==================================================== */

        const result =
            reservationRows
            .map(
                reservation => {


                    /* ========================================
                       EVENTO
                    ======================================== */

                    const event =
                        eventMap.get(
                            Number(
                                reservation.evento_id
                            )
                        );


                    /* ========================================
                       BOLETOS DE ESTA RESERVA
                    ======================================== */

                    const reservationTickets =
                        ticketRows

                        .filter(
                            ticket =>
                                Number(
                                    ticket.reserva_id
                                )
                                ===
                                Number(
                                    reservation.id
                                )
                        )

                        .map(
                            ticket => {


                                /* ============================
                                   ASIENTO
                                ============================ */

                                const seat =
                                    seatMap.get(
                                        Number(
                                            ticket.asiento_id
                                        )
                                    );


                                /* ============================
                                   MESA
                                ============================ */

                                const table =
                                    seat
                                    ?
                                    tableMap.get(
                                        Number(
                                            seat.mesa_id
                                        )
                                    )
                                    :
                                    null;


                                /* ============================
                                   ESTADO
                                ============================ */

                                const ticketState =
                                    String(
                                        ticket.estado
                                        ||
                                        ""
                                    )
                                    .toLowerCase();


                                const used =
                                    ticket.fecha_ingreso
                                    !==
                                    null

                                    ||

                                    ticketState ===
                                    "utilizado";


                                /* ============================
                                   BOLETO
                                ============================ */

                                return {

                                    id:
                                        ticket.id,

                                    token:
                                        String(
                                            ticket.token
                                            ||
                                            ""
                                        ),

                                    estado:
                                        ticket.estado
                                        ||
                                        "",

                                    fecha_creacion:
                                        ticket.fecha_creacion
                                        ||
                                        null,

                                    fecha_ingreso:
                                        ticket.fecha_ingreso
                                        ||
                                        null,

                                    utilizado:
                                        used,

                                    mesa:
                                        table?.numero
                                        ??
                                        null,

                                    asiento:
                                        seat?.numero
                                        ??
                                        null

                                };

                            }
                        );


                    /* ========================================
                       ORDENAR BOLETOS
                    ======================================== */

                    reservationTickets.sort(
                        (
                            a,
                            b
                        ) => {


                            const tableA =
                                Number(
                                    a.mesa
                                    ??
                                    0
                                );


                            const tableB =
                                Number(
                                    b.mesa
                                    ??
                                    0
                                );


                            if (
                                tableA !==
                                tableB
                            ) {

                                return (
                                    tableA
                                    -
                                    tableB
                                );

                            }


                            return (

                                Number(
                                    a.asiento
                                    ??
                                    0
                                )

                                -

                                Number(
                                    b.asiento
                                    ??
                                    0
                                )

                            );

                        }
                    );


                    /* ========================================
                       RESULTADO RESERVA
                    ======================================== */

                    return {

                        id:
                            reservation.id,

                        codigo:
                            "LT-"
                            +
                            String(
                                reservation.id
                            )
                            .padStart(
                                6,
                                "0"
                            ),

                        nombre_cliente:
                            reservation.nombre_cliente
                            ||
                            "",

                        email:
                            reservation.email
                            ||
                            "",

                        telefono:
                            reservation.telefono
                            ||
                            "",

                        cantidad_asientos:
                            Number(
                                reservation.cantidad_asientos
                                ||
                                reservationTickets.length
                                ||
                                0
                            ),

                        precio_unitario:
                            Number(
                                reservation.precio_unitario
                                ||
                                0
                            ),

                        total_reserva:
                            Number(
                                reservation.total_reserva
                                ||
                                0
                            ),

                        paid_at:
                            reservation.paid_at
                            ||
                            null,

                        created_at:
                            reservation.created_at
                            ||
                            null,

                        evento:
                            {

                                id:
                                    event?.id
                                    ??
                                    reservation.evento_id,

                                nombre:
                                    event?.nombre
                                    ??
                                    "Evento",

                                fecha:
                                    event?.fecha
                                    ??
                                    null,

                                lugar:
                                    event?.lugar
                                    ??
                                    "",

                                flyer_url:
                                    event?.flyer_url
                                    ??
                                    null,

                                descripcion:
                                    event?.descripcion
                                    ??
                                    null

                            },

                        boletos:
                            reservationTickets

                    };

                }
            );


        /* ====================================================
           ORDENAR EVENTOS

           Próximos eventos primero.
        ==================================================== */

        result.sort(
            (
                a,
                b
            ) => {


                const dateA =
                    a.evento?.fecha

                    ?

                    new Date(
                        a.evento.fecha
                    )
                    .getTime()

                    :

                    Number.MAX_SAFE_INTEGER;


                const dateB =
                    b.evento?.fecha

                    ?

                    new Date(
                        b.evento.fecha
                    )
                    .getTime()

                    :

                    Number.MAX_SAFE_INTEGER;


                return (
                    dateA
                    -
                    dateB
                );

            }
        );


        /* ====================================================
           NOMBRE DEL CLIENTE
        ==================================================== */

        const customerName =
            reservationRows
            .find(
                reservation =>
                    String(
                        reservation.nombre_cliente
                        ||
                        ""
                    )
                    .trim()
                    .length >
                    0
            )
            ?.nombre_cliente
            ||
            "";


        /* ====================================================
           RESPUESTA FINAL
        ==================================================== */

        return sendJSON(
            response,
            200,
            {

                success:
                    true,

                authenticated:
                    true,

                email:
                    customerEmail,

                nombre:
                    customerName,

                cantidad_reservas:
                    result.length,

                cantidad_boletos:
                    result.reduce(
                        (
                            total,
                            reservation
                        ) =>
                            total
                            +
                            reservation.boletos.length,
                        0
                    ),

                reservas:
                    result

            }
        );


    }

    catch(error) {


        console.error(
            "mis-entradas:",
            error
        );


        return sendJSON(
            response,
            500,
            {

                success:
                    false,

                authenticated:
                    true,

                message:
                    "No fue posible cargar tus entradas."

            }
        );

    }

}
