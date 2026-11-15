import { errorBannerClass, successBannerClass } from "./formStyles";

// A success or error banner, used by the contact form and every admin
// manager. Extracted because the same banner markup repeated in eight
// places; classes come from formStyles so nothing changes visually.
export default function Notice({
  kind,
  children,
  className = "",
}: {
  kind: "success" | "error";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      role={kind === "success" ? "status" : "alert"}
      className={`${kind === "success" ? successBannerClass : errorBannerClass} ${className}`.trim()}
    >
      {children}
    </p>
  );
}
