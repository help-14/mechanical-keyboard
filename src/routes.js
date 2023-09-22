import { lazy } from "solid-js";
import ProfileData from "./pages/Profile.data.js";
const Home = lazy(() => import("./pages/Home.js"));
const Profile = lazy(() => import("./pages/Profile.js"));
const Settings = lazy(() => import("./pages/Settings.js"));

export default [
  {
    path: "",
    component: Home,
  },
  {
    path: "profile",
    component: Profile,
    data: ProfileData
  },
  {
    path: "settings",
    component: Settings
  }
];
