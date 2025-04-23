import type { Route } from "react-router";

export type LoaderArgs = {
  request: Request;
  params: {
    id: string;
  };
};

export type ActionArgs = {
  request: Request;
  params: {
    id: string;
  };
};

export type LoaderData = {
  id: string;
  rating: number;
  review: string;
  user: {
    id: string;
    name: string;
  };
  book: {
    id: string;
    title: string;
  };
}; 