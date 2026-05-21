import { z } from "zod";
import anchorData from "@/data/anchor-app-data.json";

export const triageInputSchema = z.object({
  county: z.string().min(1),
  householdSize: z.number().int().positive(),
  hasChildren: z.boolean(),
  hasDisability: z.boolean(),
  monthlyIncome: z.number().nonnegative(),
  hasVoucher: z.boolean(),
  ownsVehicle: z.boolean(),
  criminalHistory: z.enum(["none", "old", "recent", "unknown"]),
  evictionHistory: z.enum(["none", "old", "recent", "unknown"]),
  creditRange: z.enum(["unknown", "under500", "500to579", "580to649", "650plus"]),
  sleepingSituation: z.enum(["housed_at_risk", "doubled_up", "vehicle", "shelter", "outside", "hotel"]),
  domesticViolenceConcern: z.boolean(),
  transportationAccess: z.enum(["reliable", "limited", "none"]),
  urgencyDays: z.number().int().positive()
});

export type TriageInput = z.infer<typeof triageInputSchema>;

export type TriageRecommendation = {
  category: "Most Likely Helpful" | "Possible But Difficult" | "Emergency Survival Steps" | "Housing Readiness Tasks" | "Prevention Options";
  title: string;
  rationale: string;
  priority: number;
  anchorLeads?: Array<{ id: string; name: string; category?: string | null; city?: string | null; phone?: string | null }>;
};

export function scoreTriage(input: TriageInput): TriageRecommendation[] {
  const recommendations: TriageRecommendation[] = [];

  if (input.sleepingSituation === "housed_at_risk" || input.urgencyDays > 7) {
    recommendations.push({
      category: "Prevention Options",
      title: "Try prevention before shelter entry",
      rationale: "Rental assistance, utility help, mediation, and diversion may preserve housing or avoid a longer homeless-system wait.",
      priority: 95,
      anchorLeads: leadsFor("prevention")
    });
  }

  if (input.hasVoucher) {
    recommendations.push({
      category: "Most Likely Helpful",
      title: "Use voucher-compatible housing search",
      rationale: "The highest-leverage move is filtering for verified subsidy acceptance before paying application fees.",
      priority: 92,
      anchorLeads: anchorData.triageIndex.voucherSearch.slice(0, 5)
    });
  }

  if (input.creditRange !== "650plus" || input.evictionHistory !== "none" || input.criminalHistory !== "none") {
    recommendations.push({
      category: "Housing Readiness Tasks",
      title: "Build a denial-prevention packet",
      rationale: "Credit, eviction, and background barriers should be handled before applying to strict properties.",
      priority: 86,
      anchorLeads: leadsFor("lowBarrier")
    });
  }

  if (input.sleepingSituation === "vehicle" && input.ownsVehicle) {
    recommendations.push({
      category: "Emergency Survival Steps",
      title: "Prioritize safe parking and document protection",
      rationale: "Safe parking, hygiene, food, and document storage stabilize the household while housing search continues.",
      priority: 84,
      anchorLeads: anchorData.triageIndex.vehicleLiving.slice(0, 5)
    });
  }

  if (input.domesticViolenceConcern) {
    recommendations.push({
      category: "Emergency Survival Steps",
      title: "Use confidential domestic violence pathways",
      rationale: "Safety planning and confidential shelter access should be handled separately from general public-facing searches.",
      priority: 100,
      anchorLeads: anchorData.triageIndex.domesticViolence.slice(0, 5)
    });
  }

  recommendations.push({
    category: "Possible But Difficult",
    title: "Complete Coordinated Entry, but keep parallel pathways open",
    rationale: "Coordinated Entry is important, but wait times and prioritization mean it should not be the only plan.",
    priority: input.hasChildren || input.hasDisability ? 78 : 62,
    anchorLeads: leadsFor("coordinated")
  });

  return recommendations.sort((a, b) => b.priority - a.priority);
}

function leadsFor(kind: "prevention" | "lowBarrier" | "coordinated") {
  const terms = {
    prevention: ["rental assistance", "eviction", "utility", "deposit"],
    lowBarrier: ["legal", "tenant", "reentry", "felony", "low barrier"],
    coordinated: ["coordinated", "regional access", "211"]
  }[kind];

  return anchorData.resources
    .filter((resource) => {
      const haystack = [resource.name, resource.category, resource.sourceSheet, resource.notes, resource.eligibility].filter(Boolean).join(" ").toLowerCase();
      return terms.some((term) => haystack.includes(term));
    })
    .slice(0, 5)
    .map((resource) => ({ id: resource.id, name: resource.name, category: resource.category, city: resource.city, phone: resource.phone }));
}
