// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// supabase/functions/send-stock-notifications/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { Resend } from "npm:resend";

serve(async (req) => {
  try {
    const body = await req.json();
    console.log("📩 Body rebut:", body);

    const { variant_id } = body;
    if (!variant_id) {
      return new Response("Falta variant_id", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // Clau de servei per poder eliminar
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

    // Buscar notificacions pendents
    const { data: notifications, error } = await supabase
      .from("stock_notifications")
      .select(`
        id,
        user_email,
        product_variants:variant_id (
          size,
          price_override,
          product:product_id (
            name,
            price,
            type,
            image_url
          )
        )
      `)
      .eq("variant_id", variant_id);

    if (error) {
      console.error("❌ Error consultant notificacions:", error);
      return new Response("Error consultant Supabase", { status: 500 });
    }

    if (!notifications?.length) {
      console.log("ℹ️ No hi ha usuaris per notificar");
      return new Response("No hi ha usuaris per notificar", { status: 200 });
    }

    console.log(`📬 Enviant ${notifications.length} correus...`);

    for (const n of notifications) {
      const variant = n.product_variants;
      const product = variant?.product;

      const productName = product?.name || "Producte";
      const productType = product?.type || "";
      const price = variant?.price_override ?? product?.price ?? "";
      const size = variant?.size ?? "";
      const image = product?.image_url ?? "";

      await resend.emails.send({
        from: "delivered@resend.dev",
        to: n.user_email,
        subject: `Torna a haver-hi stock: ${productName} 🎉`,
        html: `
          <p>El producte que volies ja està disponible!</p>
          <h2>${productName}</h2>
          <p>Tipus: ${productType}</p>
          <p>Talla: ${size}</p>
          <p>Preu: ${price}€</p>
          ${image ? `<img src="${image}" alt="${productName}" width="200"/>` : ""}
        `,
      });

      // 🔹 Eliminem la notificació després d'enviar el correu
      const { error: deleteError } = await supabase
        .from("stock_notifications")
        .delete()
        .eq("id", n.id);

      if (deleteError) {
        console.error("❌ Error eliminant notificació:", deleteError);
      } else {
        console.log("🗑️ Notificació eliminada:", n.id);
      }
    }

    return new Response("Correus enviats i notificacions eliminades correctament", { status: 200 });

  } catch (err) {
    console.error("❌ Error general:", err);
    return new Response("Error al processar la sol·licitud", { status: 500 });
  }
});



/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_stock_notifications' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
