import { CategoryManager } from "@/components/category-manager";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { categoryCounts, listCategories } from "@/lib/db/queries";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = listCategories(user.id);

  const counts: Record<string, number> = {};
  for (const row of categoryCounts(user.id)) {
    if (row.categoryId) counts[row.categoryId] = row.count;
  }

  return (
    <>
      <PageHeader
        index="05 · Categories"
        title="Categories"
        meta="The shorthand for why. Every entry can carry one."
      />
      <div className="px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <CategoryManager categories={categories} counts={counts} />
        </div>
      </div>
    </>
  );
}
