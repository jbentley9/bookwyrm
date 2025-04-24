import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";

export namespace Route {
  export type LoaderArgs = LoaderFunctionArgs;
  export type ActionArgs = ActionFunctionArgs;
  export type MetaArgs = Parameters<MetaFunction>[0];
} 