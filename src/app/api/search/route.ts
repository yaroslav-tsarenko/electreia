import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDescendantCategoryIds } from "@/lib/category-tree";

/**
 * Site-wide product search.
 *
 * Query params:
 *   q         — full-text-ish match against name / sku / description / brand
 *   limit     — max number of results (default 10, hard cap 100)
 *   category  — optional department slug; results are constrained to that
 *               category and all its descendants.
 *
 * Returns the shape the ProductGrid / ProductCard components expect
 * (id, name, slug, sku, price, comparePrice, quantity, images, categories).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "10") || 10);
    const categorySlug = searchParams.get("category")?.trim() || null;

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    let categoryIds: string[] | null = null;
    if (categorySlug && categorySlug !== "all") {
      const cat = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });
      if (cat) {
        categoryIds = await getDescendantCategoryIds(cat.id);
      } else {
        // Unknown category slug — return no results rather than silently
        // falling back to unfiltered search.
        return NextResponse.json([]);
      }
    }

    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        images: { some: {} },
        ...(categoryIds && {
          categories: { some: { categoryId: { in: categoryIds } } },
        }),
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        comparePrice: true,
        quantity: true,
        images: {
          select: { url: true, alt: true },
          take: 1,
          orderBy: { sortOrder: "asc" },
        },
        categories: {
          select: { category: { select: { name: true, slug: true } } },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    const shaped = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      price: Number(p.price),
      comparePrice: p.comparePrice == null ? null : Number(p.comparePrice),
      quantity: p.quantity,
      images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
      categories: p.categories.map((pc) => ({
        category: { name: pc.category.name, slug: pc.category.slug },
      })),
    }));

    return NextResponse.json(shaped);
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
