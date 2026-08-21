import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";


/* ============================================================
   VARIABLES
============================================================ */

const SUPABASE_URL =
    process.env.SUPABASE_URL;


const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY;


const RESEND_API_KEY =
    process.env.RESEND_API_KEY;


const RESEND_FROM =
    process.env.RESEND_FROM
    ||
    "Live Tickets <boletos@liveticketshn.com>";


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
   HELPERS
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


    response
        .status(status)
        .json(body);

}


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


function normalizeEmail(value) {

    return String(
        value || ""
    )
    .trim()
    .toLowerCase();

}


function validEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            value
        );

}


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
   GENERAR CÓDIGO
============================================================ */

function generateCode() {

    return crypto
        .randomInt(
            0,
            1000000
        )
        .toString()
        .padStart(
            6,
            "0"
        );

}


/* ============================================================
   HASH SEGURO DEL CÓDIGO

   Guardamos:
   salt:hash

   Nunca guardamos el código de 6 dígitos directamente.
============================================================ */

function hashCode(code) {

    const salt =
        crypto
        .randomBytes(16)
        .toString("hex");


    const derivedKey =
        crypto.scryptSync(
            code,
            salt,
            32
        );


    return (
        salt
        +
        ":"
        +
        derivedKey.toString("hex")
    );

}


/* ============================================================
   HANDLER
============================================================ */

export default async function handler(
    request,
    response
) {

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
           CONFIGURACIÓN
        ==================================================== */

        if (
            !SUPABASE_URL
            ||
            !SUPABASE_SERVICE_ROLE_KEY
            ||
            !RESEND_API_KEY
        ) {

            throw new Error(
                "Configuración del servidor incompleta."
            );

        }


        const body =
            getBody(
                request
            );


        const email =
            normalizeEmail(
                body.email
            );


        if (
            !validEmail(
                email
            )
        ) {

            return sendJSON(
                response,
                400,
                {
                    success: false,
                    message: "Ingresa un correo electrónico válido."
                }
            );

        }


        /* ====================================================
           LIMPIAR CÓDIGOS / SESIONES VIEJAS
        ==================================================== */

        try {

            await supabase.rpc(
                "limpiar_accesos_cliente"
            );

        }

        catch(error) {

            console.warn(
                "Limpieza Live Pass:",
                error
            );

        }


        /* ====================================================
           RESPUESTA GENÉRICA

           Evitamos confirmar públicamente si un correo
           tiene o no compras.
        ==================================================== */

        const genericResponse =
            {

                success: true,

                message:
                    "Si encontramos compras asociadas a este correo, recibirás un código de acceso.",

                expires_in:
                    600,

                resend_in:
                    60

            };


        /* ====================================================
           VERIFICAR QUE EXISTAN COMPRAS PAGADAS
        ==================================================== */

        const {
            data: paidReservations,
            error: reservationError
        } =
        await supabase
            .from(
                "reservas"
            )
            .select(
                "id"
            )
            .ilike(
                "email",
                email
            )
            .eq(
                "estado",
                "pagada"
            )
            .limit(
                1
            );


        if (reservationError) {

            throw reservationError;

        }


        /*
        No revelamos que el correo no tiene compras.
        */

        if (
            !paidReservations
            ||
            paidReservations.length === 0
        ) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        350
                    )
            );


            return sendJSON(
                response,
                200,
                genericResponse
            );

        }


        /* ====================================================
           RATE LIMIT: 1 CÓDIGO POR MINUTO
        ==================================================== */

        const {
            data: latestCode,
            error: latestError
        } =
        await supabase
            .from(
                "cliente_codigos_acceso"
            )
            .select(
                "id,created_at"
            )
            .eq(
                "email",
                email
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(
                1
            )
            .maybeSingle();


        if (latestError) {

            throw latestError;

        }


        if (
            latestCode?.created_at
        ) {


            const elapsed =
                Date.now()
                -
                new Date(
                    latestCode.created_at
                )
                .getTime();


            if (
                elapsed <
                60000
            ) {

                genericResponse.resend_in =
                    Math.max(
                        1,
                        Math.ceil(
                            (
                                60000
                                -
                                elapsed
                            )
                            /
                            1000
                        )
                    );


                return sendJSON(
                    response,
                    200,
                    genericResponse
                );

            }

        }


        /* ====================================================
           RATE LIMIT: MÁXIMO 5 CÓDIGOS EN UNA HORA
        ==================================================== */

        const oneHourAgo =
            new Date(
                Date.now()
                -
                60 * 60 * 1000
            )
            .toISOString();


        const {
            count,
            error: countError
        } =
        await supabase
            .from(
                "cliente_codigos_acceso"
            )
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "email",
                email
            )
            .gte(
                "created_at",
                oneHourAgo
            );


        if (countError) {

            throw countError;

        }


        if (
            Number(count || 0) >=
            5
        ) {

            return sendJSON(
                response,
                429,
                {
                    success: false,
                    message:
                        "Has solicitado varios códigos. Espera unos minutos antes de intentar nuevamente."
                }
            );

        }


        /* ====================================================
           INVALIDAR CÓDIGOS ANTERIORES
        ==================================================== */

        const now =
            new Date()
            .toISOString();


        await supabase
            .from(
                "cliente_codigos_acceso"
            )
            .update(
                {
                    usado_at:
                        now
                }
            )
            .eq(
                "email",
                email
            )
            .is(
                "usado_at",
                null
            );


        /* ====================================================
           CREAR NUEVO CÓDIGO
        ==================================================== */

        const code =
            generateCode();


        const codeHash =
            hashCode(
                code
            );


        const expiresAt =
            new Date(
                Date.now()
                +
                10 * 60 * 1000
            )
            .toISOString();


        const {
            data: insertedCode,
            error: insertError
        } =
        await supabase
            .from(
                "cliente_codigos_acceso"
            )
            .insert(
                {
                    email:
                        email,

                    codigo_hash:
                        codeHash,

                    expires_at:
                        expiresAt,

                    intentos:
                        0
                }
            )
            .select(
                "id"
            )
            .single();


        if (insertError) {

            throw insertError;

        }


        /* ====================================================
           EMAIL
        ==================================================== */

        const html = `

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
        max-width:560px;
        overflow:hidden;
        background:#ffffff;
        border-radius:22px;
    "
>


<tr>

<td style="
    padding:28px 25px;
    background:#08101f;
    text-align:center;
">

<img
    src="https://www.liveticketshn.com/LIVE_TICKETS_BLANCO.png"
    alt="Live Tickets"
    height="45"
    style="
        display:inline-block;
        height:45px;
        width:auto;
        max-width:220px;
    "
>

</td>

</tr>


<tr>

<td style="
    padding:34px 28px;
">


<div style="
    margin-bottom:7px;
    color:#2563eb;
    font-size:10px;
    font-weight:800;
    letter-spacing:1px;
">

    LIVE PASS

</div>


<div style="
    margin-bottom:13px;
    color:#111827;
    font-size:26px;
    line-height:1.2;
    font-weight:800;
">

    Accede a tus entradas

</div>


<p style="
    margin:0 0 25px;
    color:#667085;
    font-size:13px;
    line-height:1.7;
">

    Utiliza el siguiente código para acceder
    de forma segura a tus entradas de Live Tickets.

</p>


<div style="
    margin:0 auto 25px;
    padding:23px 15px;
    background:#f4f7fb;
    border:1px solid #e5e7eb;
    border-radius:16px;
    text-align:center;
">

<div style="
    margin-bottom:8px;
    color:#667085;
    font-size:9px;
    font-weight:700;
    letter-spacing:1px;
">

    TU CÓDIGO

</div>


<div style="
    color:#08101f;
    font-size:38px;
    font-weight:900;
    letter-spacing:8px;
">

    ${escapeHTML(code)}

</div>

</div>


<p style="
    margin:0;
    color:#667085;
    font-size:11px;
    line-height:1.7;
">

    Este código vence en
    <strong>10 minutos</strong>.

    <br><br>

    Si tú no solicitaste este acceso, puedes ignorar
    este mensaje.

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


        const {
            error: resendError
        } =
        await resend.emails.send(
            {

                from:
                    RESEND_FROM,

                to:
                    [
                        email
                    ],

                subject:
                    `${code} es tu código de acceso a Live Tickets`,

                html:
                    html

            }
        );


        if (resendError) {


            console.error(
                "Resend Live Pass:",
                resendError
            );


            /*
            Si el email falla, invalidamos el código.
            */

            await supabase
                .from(
                    "cliente_codigos_acceso"
                )
                .update(
                    {
                        usado_at:
                            new Date()
                            .toISOString()
                    }
                )
                .eq(
                    "id",
                    insertedCode.id
                );


            throw new Error(
                "No fue posible enviar el código."
            );

        }


        return sendJSON(
            response,
            200,
            genericResponse
        );


    }

    catch(error) {


        console.error(
            "solicitar-codigo:",
            error
        );


        return sendJSON(
            response,
            500,
            {
                success: false,
                message:
                    "No fue posible enviar el código. Intenta nuevamente."
            }
        );

    }

}
