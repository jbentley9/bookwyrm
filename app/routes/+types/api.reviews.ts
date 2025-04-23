import type { Route } from "react-router";

export type LoaderArgs = {
  request: Request;
};

export type ActionArgs = {
  request: Request;
};

export type LoaderData = {
  data: Array<{
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
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}; 