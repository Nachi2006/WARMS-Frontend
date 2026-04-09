import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { SightingLogEntry, PatrolRouteEntry } from "@/types";

interface WarmsDB extends DBSchema {
  sightings: {
    key: string;
    value: SightingLogEntry & { local_id: string };
  };
  patrol_routes: {
    key: string;
    value: PatrolRouteEntry & { local_id: string };
  };
}

let dbPromise: Promise<IDBPDatabase<WarmsDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<WarmsDB>("warms-offline", 1, {
      upgrade(db) {
        db.createObjectStore("sightings", { keyPath: "local_id" });
        db.createObjectStore("patrol_routes", { keyPath: "local_id" });
      },
    });
  }
  return dbPromise;
}

export async function saveSighting(entry: SightingLogEntry) {
  const db = await getDb();
  const id = entry.local_id ?? `sight_${Date.now()}_${Math.random()}`;
  await db.put("sightings", { ...entry, local_id: id });
  return id;
}

export async function savePatrolRoute(route: PatrolRouteEntry) {
  const db = await getDb();
  const id = route.local_id ?? `route_${Date.now()}_${Math.random()}`;
  await db.put("patrol_routes", { ...route, local_id: id });
  return id;
}

export async function getPendingSightings() {
  const db = await getDb();
  return db.getAll("sightings");
}

export async function getPendingRoutes() {
  const db = await getDb();
  return db.getAll("patrol_routes");
}

export async function clearPendingSightings() {
  const db = await getDb();
  await db.clear("sightings");
}

export async function clearPendingRoutes() {
  const db = await getDb();
  await db.clear("patrol_routes");
}
