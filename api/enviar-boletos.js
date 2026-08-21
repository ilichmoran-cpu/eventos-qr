import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import QRCode from "qrcode";


/* ============================================================
   VARIABLES PRIVADAS DE VERCEL
============================================================ */

const SUPABASE_URL =
    process.env.SUPABASE_URL;


const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY;


const RESEND_API_KEY =
    process.env.RESEND_API_KEY;


const RESEND_FROM =
    process.env.RESEND_FROM
    || "Live Tickets <boletos@liveticketshn.com>";


const SITE_URL =
    (
        process.env.SITE_URL
        || "https://www.liveticketshn.com"
    )
    .replace(/\/+$/, "");


/* ============================================================
   CLIENTES
============================================================ */

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


const resend =
    new Resend(
        RESEND_API_KEY
    );


/* ============================================================
   RESPUESTA JSON
============================================================ */

function sendJSON(
    response,
    status,
    body
) {

    response
        .status(status)
        .json(body);

}


/* ============================================================
   ESCAPAR HTML
============================================================ */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* ============================================================
   EMAIL VÁLIDO
============================================================ */

function validEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            String(
                value || ""
            )
            .trim()
        );

}


/* ============================================================
   FORMATEAR FECHA EVENTO
============================================================ */

function formatEventDate(value) {

    if (!value) {

        return "Fecha por confirmar";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Fecha por confirmar";

    }


    return new Intl.DateTimeFormat(
        "es-HN",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "America/Tegucigalpa"
        }
    )
    .format(
        date
    );

}


/* ============================================================
   BODY
============================================================ */

function getBody(request) {

    if (!request.body) {

        return {};

    }


    if (
        typeof request.body ===
        "string"
    ) {

        try {

            return JSON.parse(
                request.body
            );

        }

        catch {

            return {};

        }

    }


    return request.body;

}


/* ============================================================
   HANDLER
============================================================ */

export default async function handler(
    request,
    response
) {


    /* ========================================================
       SOLO POST
    ======================================================== */

    if (
        request.method !==
        "POST"
    ) {

        return sendJSON(
            response,
            405,
            {
                success: false,
                message: "Método no permitido."
            }
        );

    }


    try {


        /* ====================================================
           VARIABLES DE SERVIDOR
        ==================================================== */

        if (
            !SUPABASE_URL ||
            !SUPABASE_SERVICE_ROLE_KEY ||
            !RESEND_API_KEY
        ) {

            throw new Error(
                "Configuración del servidor incompleta."
            );

        }


        /* ====================================================
           AUTORIZACIÓN ADMIN
        ==================================================== */

        const authorization =
            request.headers.authorization
            || "";


        if (
            !authorization.startsWith(
                "Bearer "
            )
        ) {

            return sendJSON(
                response,
                401,
                {
                    success: false,
                    message: "Debes iniciar sesión como administrador."
                }
            );

        }


        const accessToken =
            authorization
            .substring(7)
            .trim();


        /* ====================================================
           VALIDAR USUARIO
        ==================================================== */

        const {
            data: userResult,
            error: userError
        } =
        await supabase.auth
            .getUser(
                accessToken
            );


        if (
            userError ||
            !userResult?.user
        ) {

            return sendJSON(
                response,
                401,
                {
                    success: false,
                    message: "La sesión del administrador no es válida."
                }
            );

        }


        const adminId =
            userResult.user.id;


        /* ====================================================
           COMPROBAR ROL ADMIN
        ==================================================== */

        const {
            data: admin,
            error: adminError
        } =
        await supabase
            .from(
                "usuarios_acceso"
            )
            .select(
                "user_id,rol,activo"
            )
            .eq(
                "user_id",
                adminId
            )
            .eq(
                "rol",
                "admin"
            )
            .eq(
                "activo",
                true
            )
            .maybeSingle();


        if (
            adminError ||
            !admin
        ) {

            return sendJSON(
                response,
                403,
                {
                    success: false,
                    message: "No tienes permisos de administrador."
                }
            );

        }


        /* ====================================================
           BODY
        ==================================================== */

        const body =
            getBody(
                request
            );


        const publicToken =
            String(
                body.token ||
                ""
            )
            .trim();


        const forceResend =
            body.reenviar === true;


        let requestId =
            String(
                body.request_id ||
                ""
            )
            .trim();


        if (!publicToken) {

            return sendJSON(
                response,
                400,
                {
                    success: false,
                    message: "Falta el token de la reserva."
                }
            );

        }


        /*
        El request_id solamente se utiliza
        para reenvíos manuales.

        Evita que el mismo clic genere
        duplicados por un reintento de red.
        */

        if (forceResend) {


            if (
                !requestId ||
                !/^[a-zA-Z0-9._:-]{1,120}$/
                    .test(
                        requestId
                    )
            ) {

                requestId =
                    crypto.randomUUID();

            }

        }


        /* ====================================================
           RESERVA
        ==================================================== */

        const {
            data: reserva,
            error: reservaError
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
                public_token,
                paid_at,
                email_enviado_at,
                email_resend_id
            `)
            .eq(
                "public_token",
                publicToken
            )
            .maybeSingle();


        if (reservaError) {

            throw reservaError;

        }


        if (!reserva) {

            return sendJSON(
                response,
                404,
                {
                    success: false,
                    message: "Reserva no encontrada."
                }
            );

        }


        /* ====================================================
           SOLO PAGADAS
        ==================================================== */

        if (
            reserva.estado !==
            "pagada"
        ) {

            return sendJSON(
                response,
                400,
                {
                    success: false,
                    message: "La reserva todavía no está pagada."
                }
            );

        }


        /* ====================================================
           EMAIL
        ==================================================== */

        const buyerEmail =
            String(
                reserva.email ||
                ""
            )
            .trim()
            .toLowerCase();


        if (
            !validEmail(
                buyerEmail
            )
        ) {

            return sendJSON(
                response,
                400,
                {
                    success: false,
                    code: "MISSING_EMAIL",
                    message: "La reserva no tiene un correo electrónico válido."
                }
            );

        }


        /* ====================================================
           EVITAR ENVÍO AUTOMÁTICO DUPLICADO
        ==================================================== */

        if (
            reserva.email_enviado_at &&
            !forceResend
        ) {

            return sendJSON(
                response,
                200,
                {
                    success: true,
                    already_sent: true,
                    reenviado: false,
                    email: buyerEmail,
                    message: "Los boletos ya habían sido enviados."
                }
            );

        }


        /* ====================================================
           EVENTO
        ==================================================== */

        const {
            data: evento,
            error: eventoError
        } =
        await supabase
            .from(
                "eventos"
            )
            .select(`
                id,
                nombre,
                fecha,
                lugar
            `)
            .eq(
                "id",
                reserva.evento_id
            )
            .single();


        if (eventoError) {

            throw eventoError;

        }


        /* ====================================================
           BOLETOS
        ==================================================== */

        const {
            data: boletos,
            error: boletosError
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
                estado
            `)
            .eq(
                "reserva_id",
                reserva.id
            )
            .order(
                "id",
                {
                    ascending: true
                }
            );


        if (boletosError) {

            throw boletosError;

        }


        if (
            !boletos ||
            boletos.length === 0
        ) {

            return sendJSON(
                response,
                409,
                {
                    success: false,
                    message: "La reserva está pagada pero todavía no tiene boletos."
                }
            );

        }


        /* ====================================================
           ASIENTOS
        ==================================================== */

        const asientoIds =
            [
                ...new Set(
                    boletos.map(
                        boleto =>
                            boleto.asiento_id
                    )
                )
            ];


        const {
            data: asientos,
            error: asientosError
        } =
        await supabase
            .from(
                "asientos"
            )
            .select(`
                id,
                numero,
                mesa_id
            `)
            .in(
                "id",
                asientoIds
            );


        if (asientosError) {

            throw asientosError;

        }


        /* ====================================================
           MESAS
        ==================================================== */

        const mesaIds =
            [
                ...new Set(
                    (asientos || [])
                    .map(
                        asiento =>
                            asiento.mesa_id
                    )
                )
            ];


        let mesas =
            [];


        if (
            mesaIds.length
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
                    numero
                `)
                .in(
                    "id",
                    mesaIds
                );


            if (error) {

                throw error;

            }


            mesas =
                data || [];

        }


        /* ====================================================
           MAPAS
        ==================================================== */

        const asientoMap =
            new Map(
                (asientos || [])
                .map(
                    asiento => [
                        asiento.id,
                        asiento
                    ]
                )
            );


        const mesaMap =
            new Map(
                mesas
                .map(
                    mesa => [
                        mesa.id,
                        mesa
                    ]
                )
            );


        /* ====================================================
           GENERAR QR
        ==================================================== */

        const tickets =
            [];


        const attachments =
            [];


        for (
            let index = 0;
            index < boletos.length;
            index++
        ) {


            const boleto =
                boletos[index];


            const asiento =
                asientoMap.get(
                    boleto.asiento_id
                );


            const mesa =
                asiento
                ?
                mesaMap.get(
                    asiento.mesa_id
                )
                :
                null;


            const qrBuffer =
                await QRCode.toBuffer(
                    String(
                        boleto.token
                    ),
                    {
                        type: "png",
                        width: 500,
                        margin: 2,
                        errorCorrectionLevel: "H"
                    }
                );


            const contentId =
                `live-ticket-${reserva.id}-${index + 1}`;


            attachments.push(
                {
                    filename:
                        `live-ticket-${index + 1}.png`,

                    content:
                        qrBuffer,

                    contentId:
                        contentId
                }
            );


            tickets.push(
                {
                    numero:
                        index + 1,

                    token:
                        String(
                            boleto.token
                        ),

                    mesa:
                        mesa?.numero
                        ?? "—",

                    asiento:
                        asiento?.numero
                        ?? "—",

                    contentId:
                        contentId
                }
            );

        }


        /* ====================================================
           CÓDIGO RESERVA
        ==================================================== */

        const reservationCode =
            "LT-" +

            String(
                reserva.id
            )
            .padStart(
                6,
                "0"
            );


        /* ====================================================
           HTML TICKETS
        ==================================================== */

        const ticketsHTML =
            tickets
            .map(
                ticket => `

                <div style="
                    margin:0 0 22px;
                    overflow:hidden;
                    background:#ffffff;
                    border:1px solid #e5e7eb;
                    border-radius:18px;
                ">

                    <div style="
                        padding:18px 20px;
                        background:#08101f;
                        color:#ffffff;
                    ">

                        <div style="
                            margin-bottom:7px;
                            font-size:9px;
                            font-weight:700;
                            letter-spacing:1px;
                            opacity:.6;
                        ">
                            ENTRADA ${ticket.numero}
                        </div>

                        <div style="
                            font-size:19px;
                            line-height:1.25;
                            font-weight:800;
                        ">
                            ${escapeHTML(
                                evento.nombre
                            )}
                        </div>

                    </div>


                    <div style="
                        padding:20px;
                    ">

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                margin-bottom:20px;
                            "
                        >

                            <tr>

                                <td
                                    width="48%"
                                    align="center"
                                    style="
                                        padding:13px;
                                        background:#f4f7fb;
                                        border-radius:10px;
                                    "
                                >

                                    <div style="
                                        margin-bottom:4px;
                                        color:#6b7280;
                                        font-size:9px;
                                        font-weight:700;
                                    ">
                                        MESA
                                    </div>

                                    <div style="
                                        color:#111827;
                                        font-size:23px;
                                        font-weight:800;
                                    ">
                                        ${escapeHTML(
                                            ticket.mesa
                                        )}
                                    </div>

                                </td>


                                <td width="4%">
                                </td>


                                <td
                                    width="48%"
                                    align="center"
                                    style="
                                        padding:13px;
                                        background:#f4f7fb;
                                        border-radius:10px;
                                    "
                                >

                                    <div style="
                                        margin-bottom:4px;
                                        color:#6b7280;
                                        font-size:9px;
                                        font-weight:700;
                                    ">
                                        ASIENTO
                                    </div>

                                    <div style="
                                        color:#111827;
                                        font-size:23px;
                                        font-weight:800;
                                    ">
                                        ${escapeHTML(
                                            ticket.asiento
                                        )}
                                    </div>

                                </td>

                            </tr>

                        </table>


                        <div style="
                            margin-bottom:12px;
                            text-align:center;
                            color:#111827;
                            font-size:10px;
                            font-weight:800;
                        ">
                            CÓDIGO DE ACCESO
                        </div>


                        <div style="
                            text-align:center;
                        ">

                            <img
                                src="cid:${ticket.contentId}"
                                width="220"
                                alt="Código QR"
                                style="
                                    display:inline-block;
                                    width:220px;
                                    max-width:100%;
                                    height:auto;
                                "
                            >

                        </div>


                        <div style="
                            margin-top:12px;
                            text-align:center;
                            color:#166534;
                            font-size:9px;
                            font-weight:800;
                        ">
                            ● VÁLIDO PARA 1 INGRESO
                        </div>

                    </div>

                </div>

            `)
            .join("");


        /* ====================================================
           URL ENTRADAS
        ==================================================== */

        const checkoutURL =
            `${SITE_URL}/checkout.html?token=${encodeURIComponent(
                reserva.public_token
            )}`;


        const logoURL =
            `${SITE_URL}/LIVE_TICKETS_BLANCO.png`;


        /* ====================================================
           TÍTULO EMAIL
        ==================================================== */

        const emailTitle =
            forceResend
            ? "Tus entradas han sido reenviadas"
            : "¡Tus entradas están listas!";


        const emailSubtitle =
            forceResend
            ? "REENVÍO DE ENTRADAS"
            : "COMPRA CONFIRMADA";


        /* ====================================================
           HTML EMAIL
        ==================================================== */

        const emailHTML = `

<!DOCTYPE html>

<html lang="es">

<body style="
    margin:0;
    padding:0;
    background:#f3f5f8;
    font-family:Arial,Helvetica,sans-serif;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        padding:30px 12px;
        background:#f3f5f8;
    "
>

<tr>

<td align="center">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        width:100%;
        max-width:620px;
        overflow:hidden;
        background:#ffffff;
        border-radius:22px;
    "
>


<tr>

<td style="
    padding:27px 24px;
    background:#08101f;
    color:#ffffff;
">

<img
    src="${logoURL}"
    alt="Live Tickets"
    height="45"
    style="
        display:block;
        height:45px;
        width:auto;
        max-width:220px;
        margin-bottom:24px;
    "
>


<div style="
    margin-bottom:8px;
    color:#93c5fd;
    font-size:10px;
    font-weight:700;
    letter-spacing:1px;
">
    ${emailSubtitle}
</div>


<div style="
    font-size:28px;
    line-height:1.2;
    font-weight:800;
">
    ${emailTitle}
</div>

</td>

</tr>


<tr>

<td style="
    padding:26px 24px;
">

<p style="
    margin:0 0 8px;
    color:#111827;
    font-size:16px;
    font-weight:700;
">

    Hola ${escapeHTML(
        reserva.nombre_cliente ||
        "cliente"
    )},

</p>


<p style="
    margin:0 0 24px;
    color:#6b7280;
    font-size:13px;
    line-height:1.6;
">

    ${
        forceResend

        ?

        `Te enviamos nuevamente tus entradas digitales.
         Los códigos QR siguen siendo los mismos y mantienen
         su validez original.`

        :

        `Tu compra fue confirmada correctamente.
         A continuación encontrarás tus entradas digitales.`
    }

</p>


<div style="
    margin-bottom:24px;
    padding:17px;
    background:#f7f9fc;
    border-radius:14px;
">

<div style="
    margin-bottom:11px;
    color:#111827;
    font-size:18px;
    font-weight:800;
">

    ${escapeHTML(
        evento.nombre
    )}

</div>


<div style="
    color:#6b7280;
    font-size:12px;
    line-height:1.9;
">

    📅 ${escapeHTML(
        formatEventDate(
            evento.fecha
        )
    )}

    <br>

    📍 ${escapeHTML(
        evento.lugar ||
        "Lugar por confirmar"
    )}

    <br>

    🎟 ${tickets.length}
    ${
        tickets.length === 1
        ? "entrada"
        : "entradas"
    }

    <br>

    🔖 Reserva:
    ${reservationCode}

</div>

</div>


${ticketsHTML}


<div style="
    margin-top:28px;
    text-align:center;
">

    <a
        href="${checkoutURL}"
        style="
            display:inline-block;
            padding:15px 24px;
            background:#2563eb;
            color:#ffffff;
            text-decoration:none;
            border-radius:11px;
            font-size:12px;
            font-weight:800;
        "
    >

        VER MIS ENTRADAS

    </a>

</div>


<p style="
    margin:27px 0 0;
    color:#9ca3af;
    text-align:center;
    font-size:10px;
    line-height:1.7;
">

    Cada código QR permite un solo ingreso.
    No compartas públicamente tus códigos QR.

</p>


</td>

</tr>


<tr>

<td style="
    padding:18px;
    background:#08101f;
    color:#7d899b;
    text-align:center;
    font-size:9px;
">

    © 2026 Live Tickets · Honduras

</td>

</tr>


</table>

</td>

</tr>

</table>

</body>

</html>

        `;


        /* ====================================================
           IDEMPOTENCY
        ==================================================== */

        const idempotencyKey =
            forceResend

            ?

            `live-tickets-resend-${reserva.id}-${requestId}`

            :

            `live-tickets-reserva-${reserva.id}`;


        /* ====================================================
           ENVIAR
        ==================================================== */

        const {
            data: resendData,
            error: resendError
        } =
        await resend.emails.send(
            {

                from:
                    RESEND_FROM,

                to:
                    [
                        buyerEmail
                    ],

                subject:
                    forceResend

                    ?

                    `Reenvío de tus entradas - ${evento.nombre}`

                    :

                    `Tus entradas - ${evento.nombre}`,

                html:
                    emailHTML,

                attachments:
                    attachments

            },

            {
                idempotencyKey:
                    idempotencyKey
            }
        );


        if (resendError) {

            console.error(
                "Resend:",
                resendError
            );


            return sendJSON(
                response,
                502,
                {
                    success: false,
                    message: "Los boletos están listos, pero el correo no pudo enviarse.",
                    error:
                        resendError.message
                        || "Error de Resend"
                }
            );

        }


        /* ====================================================
           MARCAR ENVÍO
        ==================================================== */

        const {
            error: updateError
        } =
        await supabase
            .from(
                "reservas"
            )
            .update(
                {

                    email_enviado_at:
                        new Date()
                        .toISOString(),

                    email_resend_id:
                        resendData?.id
                        || null

                }
            )
            .eq(
                "id",
                reserva.id
            );


        if (updateError) {

            console.error(
                "No se pudo actualizar email_enviado_at:",
                updateError
            );

        }


        /* ====================================================
           RESPUESTA
        ==================================================== */

        return sendJSON(
            response,
            200,
            {

                success: true,

                reenviado:
                    forceResend,

                email:
                    buyerEmail,

                entradas:
                    tickets.length,

                resend_id:
                    resendData?.id
                    || null,

                message:
                    forceResend
                    ? "Boletos reenviados correctamente."
                    : "Boletos enviados correctamente."

            }
        );


    }

    catch(error) {


        console.error(
            "enviar-boletos:",
            error
        );


        return sendJSON(
            response,
            500,
            {
                success: false,
                message:
                    error.message
                    || "Error interno del servidor."
            }
        );

    }

}
