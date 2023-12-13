import { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import { PageLoading } from "./components";
import {
  AdminOutlet,
  Auth,
  Downloads,
  Home,
  Login,
  MyUploadedData,
  IndiamartData,
  FacebookData,
  TradeIndiaData,
  Page404,
  Report,
  SearchHistory,
  Users,
  GlobalSearch,
  WhatsappSchedule,
  ChildReport,
  ChildSearchHistory,
  ChildIndiamartData,
  ChildFacebookData,
  ChildTradeIndiaData,
} from "./pages";

const router = createBrowserRouter(
  [
    {
      path: "/dev",
      element: <Home />,
    },
    {
      path: "/dev/admin",
      element: <AdminOutlet />,
      children: [
        {
          index: true,
          element: <SearchHistory />,
        },
        {
          path: "global-search",
          element: <GlobalSearch />,
        },
        {
          path: "search-history",
          element: <SearchHistory />,
        },
        {
          path: "my-data",
          element: <MyUploadedData />,
        },
        {
          path: "indiamart-data",
          element: <IndiamartData />,
        },
        {
          path: "fb-data",
          element: <FacebookData />,
        },
        {
          path: "tradeindia-data",
          element: <TradeIndiaData />,
        },
        {
          path: "report",
          element: <Report />,
        },
        {
          path: "wa-schedule",
          element: <WhatsappSchedule />,
        },
        {
          path: "settings",
        },
        {
          path: "users",
          element: <Users />,
        },
        {
          path: "downloads",
          element: <Downloads />,
        },
      ],
    },
    {
      path: "/dev/child",
      element: <AdminOutlet />,
      children: [
        {
          index: true,
          element: <ChildSearchHistory />,
        },
        {
          path: "search-history",
          element: <ChildSearchHistory />,
        },
        /*{
          path: "uploaded-data",
          element: <MyUploadedData />,
        },*/
        {
          path: "indiamart-data",
          element: <ChildIndiamartData />,
        },
        {
          path: "fb-data",
          element: <ChildFacebookData />,
        },
        {
          path: "tradeindia-data",
          element: <ChildTradeIndiaData />,
        },
        {
          path: "report",
          element: <ChildReport />,
        },
        /*{
          path: "users",
          element: <Users />,
        },
        {
          path: "downloads",
          element: <Downloads />,
        },*/
      ],
    },
    {
      path: "/dev/auth",
      element: <Auth />,
      children: [
        {
          path: "",
          element: <Login />,
          index: true,
        },
        {
          path: "login",
          element: <Login />,
        },
      ],
    },
    {
      path: "*",
      element: (
        <Suspense fallback={<PageLoading />}>
          <Page404 />
        </Suspense>
      ),
    },
  ]
  //{ basename: "/dev" }
);

export default router;