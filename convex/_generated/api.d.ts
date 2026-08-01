/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as applications from "../applications.js";
import type * as dashboard from "../dashboard.js";
import type * as documents from "../documents.js";
import type * as donations from "../donations.js";
import type * as featured from "../featured.js";
import type * as helpInterests from "../helpInterests.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_counters from "../lib/counters.js";
import type * as lib_ids from "../lib/ids.js";
import type * as lib_search from "../lib/search.js";
import type * as lib_studentData from "../lib/studentData.js";
import type * as maintenance from "../maintenance.js";
import type * as spotlight from "../spotlight.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  applications: typeof applications;
  dashboard: typeof dashboard;
  documents: typeof documents;
  donations: typeof donations;
  featured: typeof featured;
  helpInterests: typeof helpInterests;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/counters": typeof lib_counters;
  "lib/ids": typeof lib_ids;
  "lib/search": typeof lib_search;
  "lib/studentData": typeof lib_studentData;
  maintenance: typeof maintenance;
  spotlight: typeof spotlight;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
