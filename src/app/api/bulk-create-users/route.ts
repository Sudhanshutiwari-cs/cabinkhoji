import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    const text = await file.text();
    const students = JSON.parse(text);

    const logs: string[] = [];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    for (const s of students) {
      const { error } = await supabase.auth.admin.createUser({
        email: s.email,
        password: s.password,
        email_confirm: true,
        user_metadata: {
          name: s.name,
          roll: s.roll,
          department: s.department,
          year: 1, // Default year set to 2
          role: "student",
        },
      });

      if (error) logs.push(`❌ ${s.email}: ${error.message}`);
      else logs.push(`✅ Created: ${s.email}`);
    }

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}