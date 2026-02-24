import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.storage
    .from("about_images")
    .list("", { limit: 50, sortBy: { column: "name", order: "asc" } })

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }

  // Genera URL pública
  const images = data
    .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
    .map((file) => ({
      url: supabase
        .storage
        .from("about_images")
        .getPublicUrl(file.name).data.publicUrl,
      alt: file.name
    }))

  return NextResponse.json({ ok: true, images })
}