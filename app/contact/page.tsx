import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Contact — Innovate Ignite '26",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FFFBEB] pt-20 pb-20 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 font-mono text-[11px] tracking-[0.14em] uppercase">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0F172A]/60 hover:text-[#0F172A]">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <span className="hidden sm:inline-flex items-center gap-2 text-[#0F172A]/40">VVIT · Oct 8–9 · Bengaluru</span>
        </div>

        <div className="text-center">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#0F172A]/50">Get in touch</p>
          <h1 className="mt-2 text-[clamp(44px,8vw,88px)] font-black leading-[0.9] tracking-tight">CONTACT</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#0F172A]/60">
            Have a question about registrations, payments or venues? The team is here to help.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5">
            <div className="rounded-2xl border border-[#0F172A]/10 bg-white p-6 shadow-sm">
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#0F172A]/40">For any query</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight">Event Coordinator</h2>
              <div className="mt-6 rounded-2xl border border-[#2362EC]/20 bg-[#EFF6FF] p-5">
                <p className="text-lg font-bold leading-none">Sam Goldwin</p>
                <p className="mt-1 font-mono text-xs text-[#0F172A]/60">Event Coordinator · Innovate Ignite &apos;26</p>
                <a href="tel:+919739431299" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-5 py-2.5 text-sm font-bold text-white hover:bg-black">
                  <Phone className="h-4 w-4" /> +91 97394 31299
                </a>
                <p className="mt-3 font-mono text-[11px] text-[#0F172A]/50">Tap to call · Available 10 AM – 7 PM</p>
              </div>
              <div className="mt-6 space-y-3 font-mono text-xs text-[#0F172A]/60">
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> innovateignite@vvit.ac.in</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> VVIT Campus, Bengaluru — 13.07687, 77.665938</p>
                <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Response within a few hours on working days</p>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7">
            <div className="rounded-2xl border border-[#0F172A]/10 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-base font-bold">Visit VVIT</h3>
              <p className="mt-1 font-mono text-xs text-[#0F172A]/60">Vijaya Vittala Institute of Technology — Bengaluru</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-[#0F172A]/10">
                <iframe
                  title="VVIT Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.5!2d77.6659382!3d13.0768697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae175698c94741%3A0xd4c7cb9f6754d302!2sVijaya%20Vittala%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="https://www.google.com/maps/place/Vijaya+Vittala+Institute+of+Technology/@13.07687,77.665938,25956m/data=!3m1!1e3!4m6!3m5!1s0x3bae175698c94741:0xd4c7cb9f6754d302!8m2!3d13.0768697!4d77.6659382!16s%2Fg%2F11j8k7gv6r?hl=en" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#0F172A] px-4 py-2 text-xs font-bold text-white hover:bg-black">
                  Open in Maps <MapPin className="h-3.5 w-3.5" />
                </a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=13.0768697,77.6659382" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[#0F172A]/10 bg-white px-4 py-2 text-xs font-bold hover:bg-[#0F172A]/5">
                  Get directions
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-16" />
      </div>
    </div>
  );
}
