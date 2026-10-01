import { cookies } from "next/headers";
import { backend, getContent } from "../../lib/api";
import Editor from "./Editor";
import SignIn from "./SignIn";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false }, title: "Studio" };

export default async function Admin() {
  const cookie = (await cookies()).toString();

  // Signed-in owner gets the editor
  const me = await fetch(`${backend}/auth/me`, { headers: { cookie }, cache: "no-store" }).catch(() => null);
  if (me?.ok) return <Editor initial={await getContent(true)} />;

  // Everyone else gets the Google sign-in screen
  return <SignIn clientId={process.env.GOOGLE_CLIENT_ID || ""} />;
}