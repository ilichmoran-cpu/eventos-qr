import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";


/* ============================================================
   LIVE TICKETS
   VERIFICAR CÓDIGO LIVE PASS
============================================================ */


/* ============================================================
   VARIABLES
============================================================ */

const SUPABASE_URL =
    process.env.SUPABASE_URL;


const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY;


const COOKIE_NAME =
    "lt_livepass";


const SESSION_DAYS =
    7;


const SESSION_SECONDS =
    SESSION_DAYS
    *
    24
    *
    60
    *
    60;


/* ============================================================
   SUPABASE
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


/* ============================================================
   RESPONSE
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
   NORMALIZAR EMAIL
============================================================ */

function normalizeEmail(value) {

    return String(
        value || ""
    )
    .trim()
    .toLowerCase();

}


/* ============================================================
   VALIDAR EMAIL
============================================================ */

function validEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            value
        );

}


/* ============================================================
   VERIFICAR HASH DEL CÓDIGO
============================================================ */

function verifyCodeHash(
    code,
    storedValue
) {

    try {


        const parts =
            String(
                storedValue || ""
            )
            .split(":");


        if (
            parts.length !==
            2
        ) {

            return false;

        }


        const salt =
            parts[0];


        const expectedHex =
            parts[1];


        const calculated =
            crypto.scryptSync(
                code,
                salt,
                32
            );


        const expected =
            Buffer.from(
                expectedHex,
                "hex"
            );


        if (
            expected.length !==
            calculated.length
        ) {

            return false;

        }


        return crypto.timingSafeEqual(
            calculated,
            expected
        );


    }

    catch(error) {

        console.error(
            "verifyCodeHash:",
            error
        );


        return false;

    }

}


/* ============================================================
   GENERAR TOKEN SESIÓN
============================================================ */

function generateSessionToken() {

    return crypto
        .randomBytes(32)
        .toString(
            "base64url"
        );

}


/* ============================================================
   HASH SESIÓN
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
   COOKIE
============================================================ */

function createSessionCookie(token) {

    return [

        `${COOKIE_NAME}=${encodeURIComponent(token)}`,

        "Path=/",

        "HttpOnly",

        "Secure",

        "SameSite=Lax",

        `Max-Age=${SESSION_SECONDS}`

    ]
    .join("; ");

}


/* ============================================================
   HANDLER
============================================================ */

export default async function handler(
    request,
    response
) {

    /* ========================================================
       MÉTODO
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
           CONFIG
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
           BODY
        ==================================================== */

        const body =
            getBody(
                request
            );


        const email =
            normalizeEmail(
                body.email
            );


        const code =
            String(
                body.codigo
                ||
                body.code
                ||
                ""
            )
            .replace(
                /\D/g,
                ""
            );


        /* ====================================================
           VALIDACIONES
        ==================================================== */

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
                    message:
                        "Correo electrónico inválido."
                }
            );

        }


        if (
            !/^\d{6}$/
            .test(
                code
            )
        ) {

            return sendJSON(
                response,
                400,
                {
                    success: false,
                    message:
                        "El código debe contener 6 números."
                }
            );

        }


        /* ====================================================
           BUSCAR ÚLTIMO CÓDIGO ACTIVO
        ==================================================== */

        const {
            data: accessCode,
            error: codeError
        } =
        await supabase
            .from(
                "cliente_codigos_acceso"
            )
            .select(`
                id,
                email,
                codigo_hash,
                expires_at,
                usado_at,
                intentos,
                created_at
            `)
            .eq(
                "email",
                email
            )
            .is(
                "usado_at",
                null
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


        if (codeError) {

            throw codeError;

        }


        /* ====================================================
           NO EXISTE
        ==================================================== */

        if (!accessCode) {

            return sendJSON(
                response,
                401,
                {
                    success: false,
                    message:
                        "El código no es válido o ya venció."
                }
            );

        }


        /* ====================================================
           EXPIRADO
        ==================================================== */

        if (
            new Date(
                accessCode.expires_at
            )
            .getTime()
            <=
            Date.now()
        ) {


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
                    accessCode.id
                );


            return sendJSON(
                response,
                401,
                {
                    success: false,
                    message:
                        "El código venció. Solicita uno nuevo."
                }
            );

        }


        /* ====================================================
           DEMASIADOS INTENTOS
        ==================================================== */

        if (
            Number(
                accessCode.intentos
                ||
                0
            )
            >=
            5
        ) {


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
                    accessCode.id
                );


            return sendJSON(
                response,
                429,
                {
                    success: false,
                    message:
                        "El código fue bloqueado por demasiados intentos. Solicita uno nuevo."
                }
            );

        }


        /* ====================================================
           VERIFICAR CÓDIGO
        ==================================================== */

        const valid =
            verifyCodeHash(
                code,
                accessCode.codigo_hash
            );


        if (!valid) {


            const newAttempts =
                Number(
                    accessCode.intentos
                    ||
                    0
                )
                +
                1;


            const updateData =
                {
                    intentos:
                        newAttempts
                };


            if (
                newAttempts >=
                5
            ) {

                updateData.usado_at =
                    new Date()
                    .toISOString();

            }


            await supabase
                .from(
                    "cliente_codigos_acceso"
                )
                .update(
                    updateData
                )
                .eq(
                    "id",
                    accessCode.id
                );


            return sendJSON(
                response,
                401,
                {

                    success: false,

                    message:
                        newAttempts >= 5
                        ?
                        "Código bloqueado. Solicita uno nuevo."
                        :
                        "Código incorrecto.",

                    intentos_restantes:
                        Math.max(
                            0,
                            5 - newAttempts
                        )

                }
            );

        }


        /* ====================================================
           CONSUMIR CÓDIGO
        ==================================================== */

        const {
            data: consumed,
            error: consumeError
        } =
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
                accessCode.id
            )
            .is(
                "usado_at",
                null
            )
            .select(
                "id"
            )
            .maybeSingle();


        if (consumeError) {

            throw consumeError;

        }


        if (!consumed) {

            return sendJSON(
                response,
                401,
                {
                    success: false,
                    message:
                        "Este código ya fue utilizado."
                }
            );

        }


        /* ====================================================
           CREAR SESIÓN
        ==================================================== */

        const sessionToken =
            generateSessionToken();


        const tokenHash =
            hashSessionToken(
                sessionToken
            );


        const expiresAt =
            new Date(
                Date.now()
                +
                SESSION_SECONDS
                *
                1000
            )
            .toISOString();


        const {
            error: sessionError
        } =
        await supabase
            .from(
                "cliente_sesiones"
            )
            .insert(
                {

                    email:
                        email,

                    token_hash:
                        tokenHash,

                    expires_at:
                        expiresAt,

                    ultimo_uso_at:
                        new Date()
                        .toISOString()

                }
            );


        if (sessionError) {

            throw sessionError;

        }


        /* ====================================================
           COOKIE HTTPONLY
        ==================================================== */

        response.setHeader(
            "Set-Cookie",
            createSessionCookie(
                sessionToken
            )
        );


        /* ====================================================
           OK
        ==================================================== */

        return sendJSON(
            response,
            200,
            {

                success: true,

                message:
                    "Acceso confirmado.",

                expires_in:
                    SESSION_SECONDS

            }
        );


    }

    catch(error) {


        console.error(
            "verificar-codigo:",
            error
        );


        return sendJSON(
            response,
            500,
            {

                success: false,

                message:
                    "No fue posible verificar el código."

            }
        );

    }

}
