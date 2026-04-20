interface BreadcrumbSegment {
  label: string;
  href: string;
}

/**
 * Generate breadcrumbs dynamically from pathname
 * No manual mapping needed - auto-generates based on URL structure
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  // Remove leading/trailing slashes and split
  const segments = pathname.split("/").filter(Boolean);

  // If no segments or just "home", return single breadcrumb
  if (segments.length === 0 || pathname === "/home") {
    return [{ label: "Home", href: "/home" }];
  }

  const breadcrumbs: BreadcrumbSegment[] = [];
  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Skip dynamic segments like [id] in display, but keep in path
    const isDynamic = /^\d+$/.test(segment) || segment.match(/^[a-f0-9-]{36}$/);

    if (isDynamic) {
      // For dynamic IDs, use generic label or fetch from context
      breadcrumbs.push({
        label: "Details",
        href: currentPath,
      });
    } else {
      // Convert kebab-case to Title Case
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      breadcrumbs.push({
        label,
        href: currentPath,
      });
    }
  });

  return breadcrumbs;
}

/**
 * Get the current page title from breadcrumbs
 */
export function getPageTitle(pathname: string): string {
  const breadcrumbs = generateBreadcrumbs(pathname);
  return breadcrumbs[breadcrumbs.length - 1]?.label || "Page";
}
