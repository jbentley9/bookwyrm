import '@mantine/core/styles.css';
import type { Route } from "./+types/home";
//import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BookWyrm" },
    { name: "description", content: "Welcome to BookWyrm!" },
  ];
}

export default function Home() {
  return <p>Home</p>;
}
