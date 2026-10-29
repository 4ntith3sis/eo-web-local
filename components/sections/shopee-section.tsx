import Image from "next/image";
import { Container } from "@/components/ui/container";

export function ShopeeSection({ title, description, image }: { title?: string; description?: string; image?: string }) {
  return (
    <section className="bg-surface py-8 sm:py-10">
      <Container>
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft lg:grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[240px] bg-[#fff4ed] lg:min-h-full">{image ? <Image src={image} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" /> : <div className="flex h-full min-h-[240px] items-center justify-center text-6xl font-black text-[#ee4d2d]/20">Shopee</div>}</div>
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <span className="text-2xl font-semibold tracking-tight text-[#ee4d2d] sm:text-3xl">Shopee</span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">{title ?? "Transaksi Aman Via Marketplace"}</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">{description ?? "Pembayaran layanan EasyOffice tersedia melalui marketplace Shopee dengan transaksi yang aman dan terpercaya."}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
