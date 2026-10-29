import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BenefitsSection } from "@/components/sections/benefits-section";
import { ComparisonTable } from "@/components/sections/comparison-table";
import { PromoSection } from "@/components/sections/promo-section";
import { ShopeeSection } from "@/components/sections/shopee-section";
import { Testimonials } from "@/components/sections/testimonials";
import { FaqSection } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { ServiceLocationGrid } from "@/components/sections/service-location-grid";
import { StatsBand } from "@/components/sections/stats-band";
import { WhatsappCta } from "@/components/sections/whatsapp-cta";
import { getCmsComparisonRows, getCmsFaqs, getCmsPromotions, getCmsServiceLocations, getCmsServices, getCmsSite, getCmsTestimonials } from "@/lib/data/cms-data";
import { whatsappFor } from "@/lib/whatsapp";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service: slug } = await params;
  const cmsServices = await getCmsServices();
  const service = cmsServices.find((item) => item.slug === slug);
  const siteResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"}/api/globals/site-settings`, { next: { revalidate: 30 } }).catch(() => null);
  const site = siteResponse?.ok ? await siteResponse.json() : {};
  const seo = service?.seo;
  return {
    title: seo?.title ?? (service ? service.title : "Layanan"),
    description: seo?.description ?? (service
      ? `${service.title} EasyOffice: ${service.description}`
      : site.defaultSeoDescription ?? "Layanan EasyOffice."),
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: seo?.noIndex ? { index: false, follow: true } : undefined,
     openGraph: { title: seo?.title ?? service?.title, description: seo?.description ?? service?.description, images: seo?.ogImage ? [seo.ogImage] : service?.image ? [service.image] : undefined },
  };
}

export default async function ServiceLandingPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service: slug } = await params;
  const [cmsServices, cmsCombos, cmsPromotions, cmsComparisonRows, cmsTestimonials, site, cmsFaqs] = await Promise.all([
    getCmsServices(),
    getCmsServiceLocations(),
    getCmsPromotions(),
    getCmsComparisonRows(slug),
    getCmsTestimonials(),
    getCmsSite(),
    getCmsFaqs(slug),
  ]);
  const service = cmsServices.find((item) => item.slug === slug);
  if (!service) notFound();

   const cmsServiceCombos = cmsCombos.filter((combo) => combo.serviceSlug === service.slug);
   const serviceLocationItems = cmsServiceCombos.map((combo) => ({
     location: {
       slug: combo.locationSlug,
       name: combo.offices?.[0]?.name ?? combo.locationSlug,
     },
     combo,
     office: combo.offices?.[0],
   }));
   const preview = cmsServiceCombos[0];
   const serviceLegalNotes = [...new Set(cmsServiceCombos.map((combo) => combo.catatanLegalitas).filter(Boolean))];
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Beranda", href: "/" },
          { label: "Layanan" },
          { label: service.title },
        ]}
      />
      <Hero
        eyebrow="Layanan"
        title={service.title}
        description={service.intro}
        image={service.image}
        imageLabel={service.title}
        trustItems={Array.isArray(site.homepageHeroTrustItems) ? [...site.homepageHeroTrustItems]
          .sort((a: { sortOrder?: number }, b: { sortOrder?: number }) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((item: { text?: string }) => item.text ?? "")
          .filter(Boolean) : undefined}
        primaryCta={{
          label: "Hubungi Kami",
           href: whatsappFor(service.title, undefined, site.whatsappNumber),
          external: true,
        }}
        secondaryCta={{ label: "Lihat Paket", href: "#harga" }}
       />
       <StatsBand items={site.statsBanner} />

        <BenefitsSection serviceSlug={service.slug} eyebrow="Keunggulan" items={service.keunggulanItems} title={`Keunggulan ${service.title}`} description={`Keunggulan utama layanan ${service.title}.`} />

       <ShopeeSection
          title={`Transaksi ${service.title} melalui Marketplace`}
          description={`Pilih paket ${service.title} EasyOffice dan lakukan pembayaran dengan mudah melalui Shopee.`}
          image={site.homepageShopeeImage}
        />
       {serviceLegalNotes.length ? (
         <Section eyebrow="Informasi Legalitas" title={`Catatan Legalitas ${service.title}`} tone="gray">
           <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
             {serviceLegalNotes.map((note) => <p key={note}>{note}</p>)}
           </div>
         </Section>
       ) : null}
       <PromoSection
         promotions={cmsPromotions}
         services={cmsServices}
         title={site.homepagePromoTitle ?? `Promo Spesial ${service.title}`}
         description={site.homepagePromoDescription ?? `Lihat penawaran EasyOffice untuk layanan ${service.title} dan temukan paket yang sesuai dengan kebutuhan bisnis Anda.`}
       />

      <Section
        eyebrow="Pilih Kantor"
        title={`Kantor ${service.title} Tersedia`}
        description="Lihat harga, fasilitas, dan kontak spesifik untuk setiap kantor EasyOffice."
        tone="gray"
      >
        <ServiceLocationGrid service={service} items={serviceLocationItems} />
      </Section>

       <ComparisonTable
         rows={cmsComparisonRows}
         title={`Perbandingan ${service.title}`}
         description={`Bandingkan fasilitas dan keunggulan ${service.title} EasyOffice dengan penyedia lain.`}
         className="pt-5 sm:pt-6 lg:pt-8"
       />

        <BenefitsSection serviceSlug={service.slug} eyebrow="Manfaat" items={service.manfaatItems} title={service.manfaatTitle} description={service.manfaatDescription} />

       <Testimonials items={cmsTestimonials} />

      {preview ? (
         <FaqSection title={`FAQ ${service.title}`} faqs={cmsFaqs} />
      ) : null}

      <WhatsappCta
        title={`Tertarik dengan ${service.title}?`}
        topic={service.title}
      />
    </>
  );
}
