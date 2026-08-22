import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";


/* ==========================================================
   CONFIGURACIÓN
========================================================== */

const SUPABASE_URL =
    process.env.SUPABASE_URL;


const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY;


const COOKIE_NAME =
    "lt_livepass";


const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        }
    );


/* ==========================================================
   JSON RESPONSE
========================================================== */

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


/* ==========================================================
   COOKIES
========================================================== */

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


/* ==========================================================
   HASH SESSION TOKEN
========================================================== */

function hashSessionToken(token) {

    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

}


/* ==========================================================
   NORMALIZAR EMAIL
========================================================== */

function normalizeEmail(value) {

    return String(
        value
        ||
        ""
    )
    .trim()
    .toLowerCase();

}


/* ==========================================================
   RESERVATION CODE
========================================================== */

function reservationCode(id) {

    return (
        "LT-"
        +
        String(
            id
        )
        .padStart(
            6,
            "0"
        )
    );

}


/* ==========================================================
   UNIQUE IDS
========================================================== */

function uniqueIds(values) {

    return [
        ...new Set(
            values
                .filter(
                    value =>
                        value !== null
                        &&
                        value !== undefined
                )
                .map(
                    value =>
                        String(value)
                )
        )
    ];

}


/* ==========================================================
   HANDLER
========================================================== */

export default async function handler(
    request,
    response
) {

    if (
        request.method !==
        "GET"
    ) {

        return sendJSON(
            response,
            405,
            {
                success: false,
                authenticated: false,
                message: "Método no permitido."
            }
        );

    }


    try {


        /* ==================================================
           CONFIG SERVER
        ================================================== */

        if (
            !SUPABASE_URL
            ||
            !SUPABASE_SERVICE_ROLE_KEY
        ) {

            throw new Error(
                "Configuración del servidor incompleta."
            );

        }


        /* ==================================================
           COOKIE
        ================================================== */

        const cookies =
            parseCookies(
                request
            );


        const sessionToken =
            cookies[
                COOKIE_NAME
            ];


        if (!sessionToken) {

            return sendJSON(
                response,
                401,
                {
                    success: false,
                    authenticated: false,
                    message: "Sesión no iniciada."
                }
            );

        }


        const tokenHash =
            hashSessionToken(
                sessionToken
            );


        const now =
            new Date();


        const nowISO =
            now.toISOString();


        /* ==================================================
           BUSCAR SESIÓN
        ================================================== */

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
            .maybeSingle();


        if (sessionError) {

            throw sessionError;

        }


        if (!session) {

            return sendJSON(
                response,
                401,
                {
                    success: false,
                    authenticated: false,
                    message: "Sesión no iniciada."
                }
            );

        }


        /* ==================================================
           SESSION EXPIRED
        ================================================== */

        const expiresAt =
            new Date(
                session.expires_at
            );


        if (
            Number.isNaN(
                expiresAt.getTime()
            )
            ||
            expiresAt.getTime()
            <=
            now.getTime()
        ) {


            const {
                error: deleteError
            } =
            await supabase
                .from(
                    "cliente_sesiones"
                )
                .delete()
                .eq(
                    "id",
                    session.id
                );


            if (deleteError) {

                console.warn(
                    "Eliminar sesión expirada:",
                    deleteError
                );

            }


            return sendJSON(
                response,
                401,
                {
                    success: false,
                    authenticated: false,
                    message: "La sesión expiró."
                }
            );

        }


        /* ==================================================
           ACTUALIZAR ÚLTIMO USO
        ================================================== */

        const {
            error: lastUseError
        } =
        await supabase
            .from(
                "cliente_sesiones"
            )
            .update(
                {
                    ultimo_uso_at:
                        nowISO
                }
            )
            .eq(
                "id",
                session.id
            );


        if (lastUseError) {

            console.warn(
                "Actualizar último uso:",
                lastUseError
            );

        }


        const customerEmail =
            normalizeEmail(
                session.email
            );


        if (!customerEmail) {

            return sendJSON(
                response,
                401,
                {
                    success: false,
                    authenticated: false,
                    message: "Sesión inválida."
                }
            );

        }


        /* ==================================================
           RESERVAS PAGADAS
        ================================================== */

        const {
            data: reservations,
            error: reservationsError
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
                        false,
                    nullsFirst:
                        false
                }
            );


        if (reservationsError) {

            throw reservationsError;

        }


        const reservationRows =
            reservations
            ||
            [];


        /* ==================================================
           EMPTY
        ================================================== */

        if (
            reservationRows.length ===
            0
        ) {

            return sendJSON(
                response,
                200,
                {
                    success: true,
                    authenticated: true,
                    email: customerEmail,
                    nombre: null,
                    cantidad_reservas: 0,
                    cantidad_boletos: 0,
                    reservas: []
                }
            );

        }


        /* ==================================================
           IDS
        ================================================== */

        const reservationIds =
            uniqueIds(
                reservationRows.map(
                    item =>
                        item.id
                )
            );


        const eventIds =
            uniqueIds(
                reservationRows.map(
                    item =>
                        item.evento_id
                )
            );


        /* ==================================================
           EVENTOS
        ================================================== */

        let eventRows =
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


            eventRows =
                data
                ||
                [];

        }


        /* ==================================================
           BOLETOS
        ================================================== */

        let ticketRows =
            [];


        if (
            reservationIds.length >
            0
        ) {


            const {
                data,
                error
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


            if (error) {

                throw error;

            }


            ticketRows =
                data
                ||
                [];

        }


        /* ==================================================
           ASIENTOS
        ================================================== */

        const seatIds =
            uniqueIds(
                ticketRows.map(
                    item =>
                        item.asiento_id
                )
            );


        let seatRows =
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


            seatRows =
                data
                ||
                [];

        }


        /* ==================================================
           MESAS
        ================================================== */

        const tableIds =
            uniqueIds(
                seatRows.map(
                    item =>
                        item.mesa_id
                )
            );


        let tableRows =
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


            tableRows =
                data
                ||
                [];

        }


        /* ==================================================
           MAPS
        ================================================== */

        const eventsMap =
            new Map(
                eventRows.map(
                    item => [
                        String(item.id),
                        item
                    ]
                )
            );


        const seatsMap =
            new Map(
                seatRows.map(
                    item => [
                        String(item.id),
                        item
                    ]
                )
            );


        const tablesMap =
            new Map(
                tableRows.map(
                    item => [
                        String(item.id),
                        item
                    ]
                )
            );


        const ticketsByReservation =
            new Map();


        ticketRows.forEach(
            ticket => {


                const key =
                    String(
                        ticket.reserva_id
                    );


                if (
                    !ticketsByReservation.has(
                        key
                    )
                ) {

                    ticketsByReservation.set(
                        key,
                        []
                    );

                }


                ticketsByReservation
                    .get(
                        key
                    )
                    .push(
                        ticket
                    );


            }
        );


        /* ==================================================
           BUILD RESERVATIONS
        ================================================== */

        const resultReservations =
            reservationRows.map(
                reservation => {


                    const event =
                        eventsMap.get(
                            String(
                                reservation.evento_id
                            )
                        )
                        ||
                        null;


                    const reservationTickets =
                        ticketsByReservation.get(
                            String(
                                reservation.id
                            )
                        )
                        ||
                        [];


                    const boletos =
                        reservationTickets.map(
                            ticket => {


                                const seat =
                                    seatsMap.get(
                                        String(
                                            ticket.asiento_id
                                        )
                                    )
                                    ||
                                    null;


                                const table =
                                    seat
                                    ?
                                    tablesMap.get(
                                        String(
                                            seat.mesa_id
                                        )
                                    )
                                    :
                                    null;


                                const ticketState =
                                    String(
                                        ticket.estado
                                        ||
                                        ""
                                    )
                                    .trim()
                                    .toLowerCase();


                                const used =

                                    ticket.fecha_ingreso
                                    !==
                                    null

                                    ||

                                    ticketState ===
                                    "utilizado";


                                return {

                                    id:
                                        ticket.id,

                                    reserva_id:
                                        ticket.reserva_id,

                                    asiento_id:
                                        ticket.asiento_id,

                                    token:
                                        ticket.token,

                                    estado:
                                        ticket.estado,

                                    fecha_creacion:
                                        ticket.fecha_creacion,

                                    fecha_ingreso:
                                        ticket.fecha_ingreso,

                                    utilizado:
                                        used,

                                    mesa:
                                        table
                                        ?
                                        table.numero
                                        :
                                        null,

                                    asiento:
                                        seat
                                        ?
                                        seat.numero
                                        :
                                        null

                                };

                            }
                        );


                    return {

                        id:
                            reservation.id,

                        codigo:
                            reservationCode(
                                reservation.id
                            ),

                        evento_id:
                            reservation.evento_id,

                        nombre_cliente:
                            reservation.nombre_cliente,

                        telefono:
                            reservation.telefono,

                        email:
                            reservation.email,

                        estado:
                            reservation.estado,

                        precio_unitario:
                            Number(
                                reservation.precio_unitario
                                ||
                                0
                            ),

                        cantidad_asientos:
                            Number(
                                reservation.cantidad_asientos
                                ||
                                boletos.length
                            ),

                        total_reserva:
                            Number(
                                reservation.total_reserva
                                ||
                                0
                            ),

                        paid_at:
                            reservation.paid_at,

                        created_at:
                            reservation.created_at,

                        evento:
                            event
                            ?
                            {

                                id:
                                    event.id,

                                nombre:
                                    event.nombre,

                                fecha:
                                    event.fecha,

                                lugar:
                                    event.lugar,

                                flyer_url:
                                    event.flyer_url,

                                descripcion:
                                    event.descripcion

                            }
                            :
                            null,

                        boletos:
                            boletos

                    };

                }
            );


        /* ==================================================
           CUSTOMER NAME
        ================================================== */

        let customerName =
            null;


        for (
            const reservation
            of reservationRows
        ) {

            const value =
                String(
                    reservation.nombre_cliente
                    ||
                    ""
                )
                .trim();


            if (value) {

                customerName =
                    value;

                break;

            }

        }


        const totalTickets =
            resultReservations
                .reduce(
                    (
                        total,
                        reservation
                    ) =>
                        total
                        +
                        reservation.boletos.length,
                    0
                );


        /* ==================================================
           RESPONSE
        ================================================== */

        return sendJSON(
            response,
            200,
            {
                success: true,
                authenticated: true,
                email: customerEmail,
                nombre: customerName,
                cantidad_reservas:
                    resultReservations.length,
                cantidad_boletos:
                    totalTickets,
                reservas:
                    resultReservations
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
                success: false,
                authenticated: false,
                message:
                    "No fue posible cargar tus entradas."
            }
        );

    }

}
