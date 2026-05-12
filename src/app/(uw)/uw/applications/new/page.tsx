import { PageHeader } from "@/components/shared/page-header";
import { IntakeForm } from "./intake-form";

export default function NewApplicationPage() {
  return (
    <div>
      <PageHeader
        title="New Application"
        description="Capture merchant business details and personal guarantor info"
      />
      <IntakeForm />
    </div>
  );
}
