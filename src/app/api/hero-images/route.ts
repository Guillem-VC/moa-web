import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.storage
    .from("Hero_images")
    .list("", { limit: 50, sortBy: { column: "name", order: "asc" } })

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }

  const urls = data
    .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
    .map((file) => {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Hero_images/${file.name}`
    })

  return NextResponse.json({ ok: true, images: urls })
}
