import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ComparisonTable } from "@/components/sections/comparison-table";
import { FacilitiesGrid } from "@/components/sections/facilities-grid";
import { FaqSection } from "@/components/sections/faq";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { LocationDetailCard } from "@/components/sections/location-detail-card";
import { PricingTable } from "@/components/sections/pricing-table";
import { StatsBand } from "@/components/sections/stats-band";
import { ShopeeSection } from "@/components/sections/shopee-section";
import { WhatsappCta } from "@/components/sections/whatsapp-cta";
import { getCmsServiceLocations, getCmsServices, getCmsLocations, getCmsComparisonRows, getCmsFaqs, getCmsSite } from "@/lib/data/cms-data";
import { locationWhatsappNumber, routedWhatsappNumber, whatsappFor } from "@/lib/whatsapp";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; location: string }>;
}): Promise<Metadata> {
  const { service: serviceSlug, location: locationSlug } = await params;
  const [services, locations, combos] = await Promise.all([getCmsServices(), getCmsLocations(), getCmsServiceLocations()]);
  const service = services.find((item) => item.slug === serviceSlug);
  const combo = combos.find((entry) => entry.serviceSlug === serviceSlug && (entry.locationSlug === locationSlug || entry.offices?.some((office) => office.slug === locationSlug)));
  const location = locations.find((item) => item.slug === combo?.locationSlug);
  const office = combo?.offices?.find((entry) => entry.slug === locationSlug);
  if (!service || !location || !combo) return { title: "Layanan" };
  const officeName = office?.name ?? `EasyOffice ${location.name}`;
  const officeDescription = office?.description ?? combo.tagline;
  const seo = combo.seo;
  return {
    title: seo?.title ?? `${service.title} ${officeName}`,
    description: seo?.description ?? officeDescription,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: seo?.noIndex ? { index: false, follow: true } : undefined,
      openGraph: { title: seo?.title ?? `${service.title} ${officeName}`, description: seo?.description ?? officeDescription, images: seo?.ogImage ? [seo.ogImage] : combo.image ? [combo.image] : undefined },
  };
}

export default async function ServiceLocationPage({
  params,
}: {
  params: Promise<{ service: string; location: string }>;
}) {
  const { service: serviceSlug, location: locationSlug } = await params;
  const [cmsServices, cmsLocations, cmsCombos, cmsComparisonRows, cmsFaqs, site] = await Promise.all([
    getCmsServices(),
    getCmsLocations(),
    getCmsServiceLocations(),
    getCmsComparisonRows(serviceSlug),
    getCmsFaqs(serviceSlug),
    getCmsSite(),
  ]);
  const service = cmsServices.find((item) => item.slug === serviceSlug);
  const combo = cmsCombos.find((item) => item.serviceSlug === serviceSlug && (item.locationSlug === locationSlug || item.offices?.some((office) => office.slug === locationSlug)));
  const location = cmsLocations.find((item) => item.slug === combo?.locationSlug);
  const office = combo?.offices?.find((entry) => entry.slug === locationSlug);
  if (!service || !location || !combo) notFound();

  const officeName = office?.name ?? `EasyOffice ${location.name}`;
  const officeDescription = office?.description ?? combo.tagline;
  const address = office?.address ?? "";
  const waNumber = routedWhatsappNumber(office?.whatsappNumbers ?? combo.whatsappNumbers, office?.whatsapp ?? combo.whatsapp ?? locationWhatsappNumber(location.slug));

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Beranda", href: "/" },
          { label: "Layanan" },
          { label: service.title, href: `/layanan/${service.slug}` },
          { label: officeName },
        ]}
      />
      <Hero
        eyebrow={`${service.title} — ${location.name}`}
        title={officeName}
        description={officeDescription}
        image={combo.image}
        imageLabel={officeName}
        primaryCta={{
          label: "Hubungi Kami",
          href: whatsappFor(service.title, officeName, waNumber),
          external: true,
        }}
        secondaryCta={{
          label: "Lihat Harga",
          href: `/layanan/${service.slug}/${locationSlug}#harga`,
        }}
      />
      <StatsBand items={site.statsBanner} />

      <section className="bg-surface">
        <Container className="grid gap-8 py-8 sm:py-10 lg:grid-cols-2 lg:py-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-navy/70">
              Lokasi & Operasional
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-3xl">
              {service.title} {officeName}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-600">
              {service.intro}
            </p>
            <ul className="relative mt-7 space-y-5 pl-1">
              <span className="absolute bottom-5 left-[1.15rem] top-5 w-px bg-navy/15" aria-hidden />
              {service.keunggulanItems?.map((benefit) => {
                const title = benefit.title;
                const description = benefit.description ? [benefit.description] : [];
                return (
                <li key={benefit.title} className="relative flex items-start gap-4">
                  <span className="relative z-10 mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-navy/15 bg-surface text-navy">
                    <CheckCircle2 className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <span className="pt-1">
                    <strong className="block text-sm font-bold text-navy">{title}</strong>
                    {description.length ? (
                      <span className="mt-1 block text-sm leading-relaxed text-neutral-600">{description.join(" — ")}</span>
                    ) : null}
                  </span>
                </li>
                );
              })}
            </ul>
          </div>
          <LocationDetailCard location={{ ...location, name: officeName, address, operatingHours: office?.operatingHours ?? "", email: office?.email ?? "", whatsapp: waNumber, mapsUrl: office?.mapsUrl ?? combo.mapsUrl, latitude: office?.latitude ?? combo.latitude, longitude: office?.longitude ?? combo.longitude }} topic={service.title} whatsappNumber={waNumber} />
        </Container>
      </section>

      <ShopeeSection
        title={`Transaksi ${service.title} melalui Marketplace`}
        description={`Pilih paket ${service.title} di ${officeName} dan lakukan pembayaran melalui Shopee.`}
        image={site.homepageShopeeImage}
      />
      {combo.pricing.length ? <div id="harga">
        <PricingTable
          title={`Harga ${service.title} ${officeName}`}
          description="Harga khusus lokasi ini — hubungi kami untuk penawaran resmi."
          plans={combo.pricing}
          topic={service.title}
          locationName={officeName}
          whatsappNumber={waNumber}
        />
      </div> : null}
      {combo.catatanLegalitas ? <p className="mx-auto max-w-5xl px-6 pb-5 text-sm text-neutral-500">{combo.catatanLegalitas}</p> : null}

      <Gallery
        title={`Detail Kantor ${service.title} ${officeName}`}
        description={`Foto ruang dan fasilitas ${service.title} di ${officeName}.`}
        images={combo.gallery}
      />

      {combo.facilities.length ? <FacilitiesGrid
        title={`Fasilitas di ${officeName}`}
        description={`Fasilitas ${service.title} yang tersedia di kantor ini.`}
        items={combo.facilities}
      /> : null}
      <ComparisonTable
        rows={cmsComparisonRows}
        title={`Perbandingan ${service.title}`}
        description={`Bandingkan fasilitas dan keunggulan ${service.title} EasyOffice dengan penyedia lain.`}
      />
      {cmsFaqs.length ? <FaqSection
          title={`FAQ ${service.title} ${officeName}`}
        faqs={cmsFaqs}
      /> : null}
      <WhatsappCta
          title={`Siap Memulai di ${officeName}?`}
        description={`Hubungi tim ${officeName} melalui WhatsApp.`}
        topic={service.title}
        locationName={officeName}
        whatsappNumber={waNumber}
      />
    </>
  );
}
