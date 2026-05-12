import { redirect } from "next/navigation";

/** @deprecated Use `/dashboard` — kept for bookmarks and old links. */
export default function IntroPage() {
  redirect("/dashboard");
}
