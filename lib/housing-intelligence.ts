import anchorData from "@/data/anchor-app-data.json";
import type { TriageInput } from "@/lib/triage";

export type SearchKind = "property" | "program" | "shelter" | "prevention" | "utility" | "food" | "legal" | "map_resource";

export type SearchFilters = {
  q?: string;
  city?: string;
  county?: string;
  category?: string;
  kind?: SearchKind;
  voucher?: boolean;
  family?: boolean;
  sameDay?: boolean;
  lowBarrier?: boolean;
  limit?: number;
};

export type SearchResult = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  category: string;
  city?: string | null;
  county?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  tags: string[];
  score: number;
  confidence: number;
  sourceSheet?: string | null;
  detailHref: string;
  searchText: string;
  payload: unknown;
};

export function buildPropertyIntelligence(property: (typeof anchorData.properties)[number]) {
  const warnings: string[] = [];
  const barrierFriendliness: string[] = [];
  const geographicInsights: string[] = [];
  let approvalScore = 35;

  const voucherText = String(property.voucherAccepted ?? property.section8Accepted ?? "").toLowerCase();
  if (property.tags?.includes("Voucher Friendly") || voucherText.includes("yes")) approvalScore += 22;
  if (property.tags?.includes("Family Friendly")) approvalScore += 16;
  if (property.waitlistStatus && !String(property.waitlistStatus).toLowerCase().includes("closed")) approvalScore += 8;
  if (property.contact?.website || property.contact?.phone) approvalScore += 5;
  if (property.lastVerified) approvalScore += 7;
  if (!property.address) warnings.push("Address needs verification before map or referral use.");
  if (!property.waitlistStatus) warnings.push("Waitlist status is missing or stale.");
  if (!property.voucherAccepted && !property.section8Accepted) warnings.push("Voucher compatibility is not confirmed.");

  if (property.tags?.includes("Voucher Friendly")) barrierFriendliness.push("Voucher-friendly signal");
  if (property.tags?.includes("Family Friendly")) barrierFriendliness.push("Family-sized unit signal");
  if (property.amiLevels) barrierFriendliness.push(`${property.amiLevels} AMI restriction`);
  if (property.city) geographicInsights.push(`${property.city} search area`);
  if (property.latitude && property.longitude) geographicInsights.push("Map-ready coordinates available");

  const approvalBand = approvalScore >= 78 ? "Strong fit" : approvalScore >= 58 ? "Possible fit" : approvalScore >= 42 ? "Verify first" : "High friction";

  return {
    propertyId: property.id,
    approvalScore: Math.min(100, approvalScore),
    approvalBand,
    voucherCompatibility: voucherText.includes("yes") || property.tags?.includes("Voucher Friendly") ? "Verified or likely" : voucherText.includes("check") ? "Possible" : "Unknown",
    screeningFlexibility: String(property.programType ?? "").toLowerCase().includes("mfte") ? "Moderate" : "Strict or unknown",
    familySuitability: property.tags?.includes("Family Friendly") || property.units?.twoBedroom || property.units?.threeBedroom ? "Strong" : "Verify",
    barrierFriendliness,
    geographicInsights,
    depositRange: "Not standardized in workbook yet",
    utilityPattern: "Verify utilities before application",
    warnings,
    nextBestAction: "Call before applying and verify voucher, waitlist, deposit, utilities, and screening policy."
  };
}

function scoreResourceConfidence(resource: (typeof anchorData.resources)[number]) {
  let score = 35;
  if (resource.phone) score += 12;
  if (resource.website) score += 10;
  if (resource.address) score += 10;
  if (resource.eligibility) score += 8;
  if (resource.lastVerified) score += 15;
  if (resource.notes) score += 5;
  if (resource.flags?.sameDay) score += 5;
  return Math.min(100, score);
}

function classifyResourceKind(resource: (typeof anchorData.resources)[number]): SearchKind {
  const text = [resource.category, resource.sourceSheet, resource.name].filter(Boolean).join(" ").toLowerCase();
  if (text.includes("shelter")) return "shelter";
  if (text.includes("eviction") || text.includes("rental assistance") || text.includes("deposit")) return "prevention";
  if (text.includes("utility")) return "utility";
  if (text.includes("food") || text.includes("hygiene")) return "food";
  if (text.includes("legal") || text.includes("tenant")) return "legal";
  if (resource.latitude && resource.longitude) return "map_resource";
  return "program";
}

function resourceTags(resource: (typeof anchorData.resources)[number]) {
  const tags = [resource.category].filter(Boolean) as string[];
  if (resource.flags?.sameDay) tags.push("Same Day");
  if (resource.flags?.lowBarrier) tags.push("Low Barrier");
  if (resource.flags?.familyFriendly) tags.push("Family Friendly");
  if (resource.flags?.vehicleResident) tags.push("Vehicle Living");
  if (resource.flags?.walkIn) tags.push("Walk-In");
  if (resource.flags?.felonyFriendly) tags.push("Felony Friendly");
  return tags.slice(0, 6);
}

export const normalizedProperties = anchorData.properties.map((property) => ({
  ...property,
  intelligence: buildPropertyIntelligence(property)
}));

export const normalizedResources = anchorData.resources.map((resource) => ({
  ...resource,
  confidence: scoreResourceConfidence(resource),
  kind: classifyResourceKind(resource)
}));

export const masterSearchIndex: SearchResult[] = [
  ...normalizedProperties.map((property): SearchResult => ({
    id: property.id,
    kind: "property",
    title: property.name,
    subtitle: [property.city, property.programType, property.waitlistStatus].filter(Boolean).join(" · "),
    category: property.programType || "Housing property",
    city: property.city,
    county: property.county,
    latitude: property.latitude,
    longitude: property.longitude,
    tags: [...(property.tags ?? []), property.intelligence.approvalBand, property.intelligence.voucherCompatibility],
    score: property.intelligence.approvalScore,
    confidence: property.lastVerified ? 75 : property.address ? 55 : 40,
    sourceSheet: property.sourceSheet,
    detailHref: `/properties/${encodeURIComponent(property.id)}`,
    searchText: [property.searchText, property.name, property.city, property.programType, property.amiLevels, property.tags?.join(" ")].filter(Boolean).join(" ").toLowerCase(),
    payload: property
  })),
  ...normalizedResources.map((resource): SearchResult => ({
    id: resource.id,
    kind: resource.kind,
    title: resource.name,
    subtitle: [resource.city, resource.phone, resource.hours].filter(Boolean).join(" · "),
    category: resource.category || resource.sourceSheet || "Resource",
    city: resource.city,
    county: resource.county,
    latitude: resource.latitude,
    longitude: resource.longitude,
    tags: resourceTags(resource),
    score: resource.confidence,
    confidence: resource.confidence,
    sourceSheet: resource.sourceSheet,
    detailHref: `/resources?selected=${encodeURIComponent(resource.id)}`,
    searchText: [resource.searchText, resource.name, resource.category, resource.city, resource.populationServed, resource.eligibility, resource.notes].filter(Boolean).join(" ").toLowerCase(),
    payload: resource
  }))
].sort((a, b) => b.score - a.score);

export const mapPoints = masterSearchIndex
  .filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number")
  .map((item) => ({
    id: item.id,
    kind: item.kind,
    title: item.title,
    category: item.category,
    city: item.city,
    county: item.county,
    neighborhood: null,
    latitude: item.latitude as number,
    longitude: item.longitude as number,
    serviceType: item.kind === "property" ? "Housing option" : item.category,
    transitProximity: null,
    confidence: item.confidence
  }));

export function searchUnified(filters: SearchFilters): SearchResult[] {
  const query = filters.q?.trim().toLowerCase();
  const terms = query?.split(/[^a-z0-9]+/).filter(Boolean) ?? [];
  const limit = Number.isFinite(filters.limit) ? Number(filters.limit) : 60;

  return masterSearchIndex
    .filter((item) => {
      if (filters.kind && item.kind !== filters.kind) return false;
      if (filters.city && item.city?.toLowerCase() !== filters.city.toLowerCase()) return false;
      if (filters.county && item.county?.toLowerCase() !== filters.county.toLowerCase()) return false;
      if (filters.category && !item.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
      if (filters.voucher && item.kind === "property" && !item.tags.includes("Voucher Friendly")) return false;
      if (filters.family && !item.tags.some((tag) => tag.toLowerCase().includes("family"))) return false;
      if (filters.sameDay && !item.tags.includes("Same Day")) return false;
      if (filters.lowBarrier && !item.tags.includes("Low Barrier")) return false;
      if (terms.length && !terms.some((term) => item.searchText.includes(term))) return false;
      return true;
    })
    .slice(0, limit);
}

export function getPropertyById(id: string) {
  return normalizedProperties.find((property) => property.id === id);
}

export function recommendForTriage(input: TriageInput) {
  const queries = ["coordinated entry 211"];
  if (input.hasVoucher) queries.push("voucher family");
  if (input.sleepingSituation === "vehicle") queries.push("safe parking vehicle hygiene");
  if (input.sleepingSituation === "housed_at_risk") queries.push("eviction prevention rental assistance utility deposit");
  if (input.domesticViolenceConcern) queries.push("domestic violence confidential shelter legal");
  if (input.creditRange !== "650plus" || input.criminalHistory !== "none" || input.evictionHistory !== "none") queries.push("legal tenant low barrier felony reentry");

  const seen = new Set<string>();
  return queries.flatMap((q) => searchUnified({ q, family: input.hasChildren, limit: 8 })).filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).slice(0, 24);
}
