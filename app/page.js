import { getContent } from "../lib/api";
import Portfolio from "./Portfolio";

export default async function Home() {
  return <Portfolio c={await getContent()} />;
}
