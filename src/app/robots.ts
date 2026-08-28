import type { MetadataRoute } from "next";
import { buildDiscoveryRobots } from "@/lib/discovery-artifacts";
import { getCanonicalUrl, isProductionDeployment } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return buildDiscoveryRobots(isProductionDeployment(), getCanonicalUrl);
}
