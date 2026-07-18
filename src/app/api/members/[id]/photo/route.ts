import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { uploadMemberPhoto } from "@/lib/members";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Ctx) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Photo file is required" },
        { status: 400 },
      );
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed" },
        { status: 400 },
      );
    }
    const member = await uploadMemberPhoto(id, file);
    return NextResponse.json(member);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload photo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
