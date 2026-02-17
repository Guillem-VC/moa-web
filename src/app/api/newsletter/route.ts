import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email || "").toLowerCase().trim()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Invalid email" },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from("newsletter")
      .insert({ email })

    if (error) {
      // duplicate email
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, alreadySubscribed: true })
      }

      console.error("SUPABASE INSERT ERROR:", error)

      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("NEWSLETTER API ERROR:", err)
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    )
  }
}
