import { BlockForm } from "@/components/block-form";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { listCategories } from "@/lib/db/queries";

export const metadata = { title: "New entry" };

export default async function NewBlockPage() {
  const user = await requireUser();
  const categories = listCategories(user.id);

  return (
    <>
      <PageHeader
        index="03 · New entry"
        title="File a new entry"
        meta="Who you blocked, and the reason while it's still fresh."
      />
      <BlockForm categories={categories} />
    </>
  );
}
