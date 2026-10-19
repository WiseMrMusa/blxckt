import { notFound } from "next/navigation";

import { BlockForm } from "@/components/block-form";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getBlock, listCategories } from "@/lib/db/queries";
import { caseRef } from "@/lib/util";

export const metadata = { title: "Edit entry" };

export default async function EditBlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const record = getBlock(user.id, id);
  if (!record) notFound();

  const categories = listCategories(user.id);

  return (
    <>
      <PageHeader
        index={`Case ${caseRef(record.block.seq)} · Edit`}
        title={`@${record.block.handle}`}
        meta="Amend the record. The original date is preserved unless you change it."
      />
      <BlockForm
        categories={categories}
        block={record.block}
        evidence={record.evidence}
      />
    </>
  );
}
