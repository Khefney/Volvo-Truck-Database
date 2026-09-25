import { tripEstimate, assumptionMap } from "./deploy/api/src/estimates.js";
import { scoreVehicle } from "./deploy/api/src/health.js";
import fs from "fs";
import vm from "vm";

const src = fs.readFileSync("_dc.js", "utf8");
const start = src.indexOf("function payloadFactor");
const end = src.indexOf("function gramsPerKm");
const healthStart = src.indexOf("function localHealth");
const healthEnd = src.indexOf("function project");
const context = { Date, Math, Number };
vm.createContext(context);
vm.runInContext("const KM_PER_MI = 1.60934;\n" + src.slice(start, end) + "\n" + src.slice(healthStart, healthEnd) + "\nthis.tripEstimate = tripEstimate; this.localHealth = localHealth;", context);

const map = assumptionMap([]);
const miles = 94;
for (const type of ["Electric", "Diesel", "Natural Gas"]) {
  const back = tripEstimate(type, miles, map, "Heavy", true);
  const front = context.tripEstimate(type, miles, map, "Heavy", true);
  for (const key of ["costUsd", "co2Kg", "energyKwh", "fuelGal", "fuelGge"]) {
    if (key in back && front[key] !== back[key]) {
      throw new Error(type + " " + key + " front " + front[key] + " back " + back[key]);
    }
  }
}

const staleDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const truck = { id: "VT-0108", level: 80, status: "Active" };
const staleRows = [[staleDate, "VT-0108", "Inspection", "Old check", 0, "Closed"]];
const recentRows = [[recentDate, "VT-0108", "Inspection", "Recent check", 0, "Closed"]];
const staleBack = scoreVehicle("VT-0108", [], [{ truck_id: "VT-0108", date: staleDate, kind: "Inspection", descr: "Old check", status: "Closed" }]);
const recentBack = scoreVehicle("VT-0108", [], [{ truck_id: "VT-0108", date: recentDate, kind: "Inspection", descr: "Recent check", status: "Closed" }]);
const staleFront = context.localHealth(truck, [], staleRows);
const recentFront = context.localHealth(truck, [], recentRows);
if (staleFront.score !== staleBack.score || !staleFront.reasons.some(r => r.text.includes("90 days"))) {
  throw new Error("stale mismatch " + JSON.stringify({ staleFront, staleBack }));
}
if (recentFront.score !== recentBack.score || recentFront.reasons.some(r => r.delta === -15)) {
  throw new Error("recent mismatch " + JSON.stringify({ recentFront, recentBack }));
}
console.log("estimates and health match", staleFront.score, recentFront.score);
