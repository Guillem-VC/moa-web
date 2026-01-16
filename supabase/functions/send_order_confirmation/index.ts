import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { Resend } from "npm:resend";

serve(async (req) => {
  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response("Falta order_id", { status: 400 });
    }

    console.log("Order ID:", order_id);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

    // 🔹 1️⃣ Obtenir comanda
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        total_amount,
        created_at,
        paid_at
      `)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("❌ Error carregant comanda:", orderError);
      return new Response("Order not found", { status: 404 });
    }

    // 🔹 2️⃣ Obtenir email de l'usuari des de profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", order.user_id)
      .single();

    if (profileError || !profile) {
      console.error("❌ Error carregant perfil:", profileError);
      return new Response("Usuari sense email", { status: 400 });
    }

    const email = profile.email;
    console.log("User email:", email);

    // 🔹 3️⃣ Obtenir items de la comanda
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        quantity,
        unit_price,
        product:products (
          name,
          image_url
        ),
        variant:product_variants (
          size
        )
      `)
      .eq("order_id", order.id);

    if (itemsError) {
      console.error("❌ Error carregant items:", itemsError);
      return new Response("Error carregant items de la comanda", { status: 500 });
    }

    // 🔹 Generar HTML dels items amb estil
    const itemsHtml = items.map((item: any) => `
      <li style="list-style: none; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;">
        ${item.product?.image_url ? `<img src="${item.product.image_url}" alt="${item.product.name}" width="80" style="border-radius: 8px;"/>` : ""}
        <div>
          <strong style="font-size: 1rem;">${item.product?.name}</strong><br/>
          ${item.variant?.size ? `<em>Talla: ${item.variant.size}</em><br/>` : ""}
          Cantidad: ${item.quantity} × ${item.unit_price} €
        </div>
      </li>
    `).join("");

    const paidDate = order.paid_at
      ? new Date(order.paid_at).toLocaleString("es-ES", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Europe/Madrid" // Ajust a hora d’Espanya
        })
      : "No disponible";

    // 🔹 Enviar email amb Resend
    await resend.emails.send({
      from: "delivered@resend.dev",
      to: email,
      subject: `Pedido: #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.4; max-width: 600px; margin: auto;">
          <h2 style="color: #e11d48;">Gracias por su compra!</h2>
          <p>Tu pedido ha sido confirmado y se encuentra en proceso de preparación.</p>

          <p><strong>Pedido:</strong> ${order.id}<br/>
          <strong>Fecha:</strong> ${paidDate}</p>

          <ul style="padding: 0; margin: 0;">${itemsHtml}</ul>

          <p style="font-size: 1.1rem;"><strong>Total:</strong> ${order.total_amount} €</p>

          <p style="color: #555; font-size: 0.9rem;">Gracias por confiar en nosotros. ¡Esperamos verte pronto de nuevo!</p>
        </div>
      `
    });

    /* Problema de error a supabase
    // 🔹 4️⃣ Actualitzar status a 'processing' després d’enviar el correu
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', order.id);
*/

    console.log("✅ Email enviat correctament a", email);
    console.log("Status canviat a Processing")
    return new Response("Email enviat correctament i status a processing", { status: 200 });

  } catch (err) {
    console.error("❌ Error general:", err);
    return new Response("Error intern", { status: 500 });
  }
});
