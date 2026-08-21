import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";


/* ============================================================
   LIVE TICKETS
   CERRAR SESIÓN LIVE PASS
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
   HASH DEL TOKEN DE SESIÓN
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
   COOKIE PARA CERRAR SESIÓN
============================================================ */

function clearCookie() {

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

                success:
                    false,

                message:
                    "Método no permitido."

            }
        );

    }


    try {


        /* ====================================================
           LEER COOKIE
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
           BORRAR SESIÓN EN SUPABASE
        ==================================================== */

        if (
            token
            &&
            SUPABASE_URL
            &&
            SUPABASE_SERVICE_ROLE_KEY
        ) {


            const tokenHash =
                hashSessionToken(
                    token
                );


            const {
                error
            } =
            await supabase
                .from(
                    "cliente_sesiones"
                )
                .delete()
                .eq(
                    "token_hash",
                    tokenHash
                );


            if (error) {

                console.warn(
                    "Eliminar sesión Live Pass:",
                    error
                );

            }

        }


        /* ====================================================
           ELIMINAR COOKIE DEL NAVEGADOR
        ==================================================== */

        response.setHeader(
            "Set-Cookie",
            clearCookie()
        );


        /* ====================================================
           RESPUESTA
        ==================================================== */

        return sendJSON(
            response,
            200,
            {

                success:
                    true,

                message:
                    "Sesión cerrada correctamente."

            }
        );


    }

    catch(error) {


        console.error(
            "cerrar-sesion-cliente:",
            error
        );


        /*
        Aunque Supabase falle, eliminamos
        igualmente la cookie del navegador.
        */

        response.setHeader(
            "Set-Cookie",
            clearCookie()
        );


        return sendJSON(
            response,
            200,
            {

                success:
                    true,

                message:
                    "Sesión cerrada."

            }
        );

    }

}
