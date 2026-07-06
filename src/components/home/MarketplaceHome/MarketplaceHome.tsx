"use client";

import { PromoStrip } from "../PromoStrip/PromoStrip";
import { HeroCarousel } from "../HeroCarousel/HeroCarousel";
import { PromoBannerGrid } from "../PromoBannerGrid/PromoBannerGrid";
import { BrandStrip } from "../BrandStrip/BrandStrip";
import { ProductSection } from "../ProductSection/ProductSection";
import { SaleStrip } from "../SaleStrip/SaleStrip";
import { DealOfTheDay } from "../DealOfTheDay/DealOfTheDay";
import { NewsletterBanner } from "../NewsletterBanner/NewsletterBanner";
import { TrustStrip } from "../TrustStrip/TrustStrip";
import { StatsBand } from "../StatsBand/StatsBand";
import { ShopByPurpose } from "../ShopByPurpose/ShopByPurpose";
import { ServicePromise } from "../ServicePromise/ServicePromise";
import { Testimonials } from "../Testimonials/Testimonials";
import { KnowledgeHub } from "../KnowledgeHub/KnowledgeHub";
import { CategoryShowcase } from "../CategoryShowcase/CategoryShowcase";
import { WhyShopWithUs } from "../WhyShopWithUs/WhyShopWithUs";
import { HomeCTABanners } from "../HomeCTABanners/HomeCTABanners";
import type { HomepageProduct, CategorySection, BrandSection } from "@/lib/homepage-products";

interface BannerData {
  id: string;
  type: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string | null;
  bgColor: string;
  textColor: string;
  badgeText?: string | null;
  oldPrice?: string | null;
  newPrice?: string | null;
  discountText?: string | null;
}

interface SectionData {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  filterType: string;
  categorySlug?: string | null;
  maxProducts: number;
  viewAllUrl?: string | null;
  viewAllLabel: string;
  bgStyle: string;
  columns: number;
}

interface TabData {
  id: string;
  label: string;
  icon?: string | null;
  linkUrl: string;
  color: string;
}

interface UtilityLinkData {
  id: string;
  label: string;
  linkUrl: string;
  icon?: string | null;
  position: string;
}

interface PromoStripData {
  id: string;
  icon: string;
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
}

interface BrandData {
  id: string;
  name: string;
  logoUrl?: string | null;
  linkUrl?: string | null;
}

interface CategoryShowcaseItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount: number;
}

interface Props {
  data: {
    heroSlides: BannerData[];
    dealCards: BannerData[];
    promoSmall: BannerData[];
    promoWide: BannerData[];
    brands: BrandData[];
    sections: SectionData[];
    tabs: TabData[];
    utilityLinks: UtilityLinkData[];
    promoStripItems: PromoStripData[];
    sectionProducts: Record<string, HomepageProduct[]>;
    categories: { id: string; name: string; slug: string; _count: { products: number } }[];
    featuredProducts: HomepageProduct[];
    saleProducts: HomepageProduct[];
    newProducts: HomepageProduct[];
    popularProducts: HomepageProduct[];
    categorySections: CategorySection[];
    brandSections: BrandSection[];
    categoryShowcase: CategoryShowcaseItem[];
  };
}

export function MarketplaceHome({ data }: Props) {
  const {
    heroSlides, dealCards, promoSmall, promoWide,
    brands, sections, promoStripItems,
    sectionProducts, saleProducts, newProducts,
    popularProducts, categorySections, categoryShowcase,
  } = data;

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)]">
      <PromoStrip items={promoStripItems} />

      <HeroCarousel slides={heroSlides} deals={dealCards} />

      <div className="mx-auto max-w-[var(--container-content)] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-start gap-0">
          <div className="flex min-w-0 flex-1 flex-col gap-16 sm:gap-20">
            {/* === ABOVE THE FOLD — start selling immediately === */}

            <HomeCTABanners />

            {/* Most Popular — visible right after hero */}
            {popularProducts.length > 0 && (
              <ProductSection
                title="Most Popular"
                subtitle="Top products customers buy this week"
                products={popularProducts}
                viewAllHref="/catalog?sort=popular"
                viewAllLabel="View all popular"
                bg="white"
                columns={5}
              />
            )}

            {/* New Arrivals — right after popular */}
            {newProducts.length > 0 && (
              <ProductSection
                title="New Arrivals"
                subtitle="Just landed in store"
                products={newProducts}
                viewAllHref="/catalog?sort=newest"
                viewAllLabel="View all new"
                bg="gray"
                columns={5}
              />
            )}

            {/* Top deals strip — a tight horizontal product row */}
            {saleProducts.length > 0 && (
              <SaleStrip products={saleProducts} />
            )}

            {/* First category section, e.g. "Audio and Hi-Fi equipment" */}
            {categorySections.slice(0, 1).map((cs) => (
              <ProductSection
                key={cs.category.id}
                title={cs.category.name}
                subtitle={`${cs.totalCount ?? cs.products.length}+ products`}
                products={cs.products}
                tabs={cs.tabs}
                viewAllHref={`/catalog/${cs.category.slug}`}
                viewAllLabel={`All ${cs.category.name}`}
                bg="white"
                columns={5}
              />
            ))}

            {/* === Light supporting blocks between product sections === */}

            <StatsBand />

            <PromoBannerGrid smallBanners={promoSmall} wideBanners={promoWide} />

            {/* More category product sections */}
            {categorySections.slice(1, 3).map((cs, i) => (
              <ProductSection
                key={cs.category.id}
                title={cs.category.name}
                subtitle={`${cs.totalCount ?? cs.products.length}+ products`}
                products={cs.products}
                tabs={cs.tabs}
                viewAllHref={`/catalog/${cs.category.slug}`}
                viewAllLabel={`All ${cs.category.name}`}
                bg={i % 2 === 0 ? "gray" : "white"}
                columns={5}
              />
            ))}

            {/* Trust strip */}
            <TrustStrip />

            {/* Deal of the Day */}
            {saleProducts.length > 0 && (
              <DealOfTheDay product={saleProducts[0]} />
            )}

            {/* More categories */}
            {categorySections.slice(3, 6).map((cs, i) => (
              <ProductSection
                key={cs.category.id}
                title={cs.category.name}
                subtitle={`${cs.totalCount ?? cs.products.length}+ products`}
                products={cs.products}
                tabs={cs.tabs}
                viewAllHref={`/catalog/${cs.category.slug}`}
                viewAllLabel={`All ${cs.category.name}`}
                bg={i % 2 === 0 ? "white" : "gray"}
                columns={5}
              />
            ))}

            {/* Curated entry points */}
            <ShopByPurpose />

            {/* Category showcase (colorful tiles) */}
            {categoryShowcase.length > 0 && (
              <CategoryShowcase categories={categoryShowcase} />
            )}

            {/* Service Promise — premium narrative block */}
            <ServicePromise />

            {/* Why shop with us */}
            <WhyShopWithUs />

            {/* Testimonials */}
            <Testimonials />

            {/* Brand Strip */}
            {brands.length > 0 && <BrandStrip brands={brands} />}

            {/* Admin-configured sections */}
            {sections.map((section) => {
              const products = sectionProducts[section.slug] || [];
              if (!products.length) return null;
              return (
                <ProductSection
                  key={section.id}
                  title={section.title}
                  subtitle={section.subtitle || undefined}
                  products={products}
                  viewAllHref={section.viewAllUrl || "/catalog"}
                  viewAllLabel={section.viewAllLabel}
                  bg={section.bgStyle as "white" | "gray"}
                  columns={section.columns}
                />
              );
            })}

            {/* Knowledge hub */}
            <KnowledgeHub />

            {/* Newsletter */}
            <NewsletterBanner />
          </div>
        </div>
      </div>
    </div>
  );
}
